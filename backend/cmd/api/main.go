package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/docverify/backend/internal/audit"
	"github.com/docverify/backend/internal/auth"
	"github.com/docverify/backend/internal/config"
	"github.com/docverify/backend/internal/document"
	"github.com/docverify/backend/internal/middleware"
	"github.com/docverify/backend/internal/verify"
	"github.com/docverify/backend/pkg/database"
	applogger "github.com/docverify/backend/pkg/logger"
	"github.com/docverify/backend/pkg/storage"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"

	_ "github.com/docverify/backend/docs"
)

// @title DocVerify API
// @version 1.0
// @description Digital document verification platform API
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter "Bearer {token}"
func main() {
	cfg, err := config.Load()
	if err != nil {
		slog.Error("config error", "error", err)
		os.Exit(1)
	}

	log := applogger.New(cfg.GinMode)
	slog.SetDefault(log)

	if err := database.RunMigrations(cfg.DBURL); err != nil {
		slog.Error("migration error", "error", err)
		os.Exit(1)
	}

	db, err := database.Connect(cfg.DBURL)
	if err != nil {
		slog.Error("database connection error", "error", err)
		os.Exit(1)
	}

	ctx := context.Background()
	store, err := storage.NewStore(ctx, cfg.StorageDriver, db, storage.Config{
		Endpoint:  cfg.S3Endpoint,
		Bucket:    cfg.S3Bucket,
		AccessKey: cfg.S3AccessKey,
		SecretKey: cfg.S3SecretKey,
		Region:    cfg.S3Region,
		UseSSL:    cfg.S3UseSSL,
	})
	if err != nil {
		slog.Error("storage init error", "error", err)
		os.Exit(1)
	}

	auditLogger := audit.NewLogger(db)

	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo, cfg.JWTSecret, cfg.JWTExpiry)
	authHandler := auth.NewHandler(authService)

	docRepo := document.NewRepository(db)
	docService := document.NewService(docRepo, store, auditLogger, cfg.FrontendURL, cfg.MaxUploadBytes)
	docHandler := document.NewHandler(docService)

	verifyService := verify.NewService(docRepo, auditLogger, store, cfg.S3Bucket)
	verifyHandler := verify.NewHandler(verifyService)

	verifyLimiter := middleware.NewRateLimiter(cfg.VerifyRateLimit, cfg.VerifyRateBurst)

	gin.SetMode(cfg.GinMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(cfg.CORSOrigins()...))
	router.Use(middleware.RequestID())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	router.GET("/ready", readyHandler(db, store))

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := router.Group("/api")
	{
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
			authRoutes.GET("/me", middleware.JWTMiddleware(authService), authHandler.Me)
		}

		verifyRoutes := api.Group("/verify")
		verifyRoutes.Use(verifyLimiter.Middleware())
		{
			verifyRoutes.GET("/preview/:short_id", verifyHandler.Preview)
			verifyRoutes.GET("/:short_id", verifyHandler.Verify)
		}

		docRoutes := api.Group("/docs")
		docRoutes.Use(middleware.JWTMiddleware(authService))
		{
			docRoutes.POST("", docHandler.Upload)
			docRoutes.GET("", docHandler.List)
			docRoutes.GET("/stats", docHandler.Stats)
			docRoutes.GET("/:id", docHandler.Get)
			docRoutes.PATCH("/:id/revoke", docHandler.Revoke)
			docRoutes.GET("/:id/pdf", docHandler.DownloadPDF)
		}
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	go func() {
		slog.Info("server starting", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("shutting down server")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("shutdown error", "error", err)
	}

	sqlDB, _ := db.DB()
	if sqlDB != nil {
		_ = sqlDB.Close()
	}
}

func readyHandler(db *gorm.DB, store storage.Store) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := database.Ping(db); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "not_ready", "db": "down"})
			return
		}
		if err := store.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "not_ready", "storage": "down"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ready"})
	}
}
