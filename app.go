package main

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type FileSizeInfo struct {
	Path string `json:"path"`
	Size int64  `json:"size"`
}

type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetFileSizes scans the specified directory recursively and returns file size info
func (a *App) GetFileSizes(dirPath string) ([]FileSizeInfo, error) {
	// Convert to absolute path and clean it
	absPath, err := filepath.Abs(dirPath)
	if err != nil {
		return nil, fmt.Errorf("invalid path: %v", err)
	}
	absPath = filepath.Clean(absPath)

	// Check if directory exists and is accessible
	info, err := os.Stat(absPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("directory does not exist: %s", dirPath)
		}
		if os.IsPermission(err) {
			return nil, fmt.Errorf("permission denied: %s", dirPath)
		}
		return nil, fmt.Errorf("error accessing directory: %v", err)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("path is not a directory: %s", dirPath)
	}

	var results []FileSizeInfo
	basePath := absPath

	err = filepath.Walk(absPath, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			// Skip files we can't access
			if os.IsPermission(err) {
				runtime.LogWarningf(a.ctx, "Permission denied: %s", path)
				return nil
			}
			return err
		}

		if !info.IsDir() {
			// Make path relative to base directory
			relPath, err := filepath.Rel(basePath, path)
			if err != nil {
				runtime.LogWarningf(a.ctx, "Error getting relative path: %v", err)
				return nil
			}

			// Convert to forward slashes for consistency and clean the path
			relPath = strings.TrimPrefix(filepath.ToSlash(relPath), "/")
			if relPath == "" {
				return nil
			}

			results = append(results, FileSizeInfo{
				Path: relPath,
				Size: info.Size(),
			})
		}
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("error walking directory: %v", err)
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no files found in directory: %s", dirPath)
	}

	return results, nil
}

// SelectDirectory opens a dialog to select a directory, returning its path
func (a *App) SelectDirectory() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{})
}
