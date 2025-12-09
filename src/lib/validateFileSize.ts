/**
 * Convert bytes to MB
 * @param bytes File size in bytes
 * @returns Size in megabytes (MB)
 */
export const bytesToMB = (bytes: number): number => {
    return bytes / (1024 * 1024);
};

/**
 * Check if file size is within the allowed limit
 * @param file File object (e.g., from input[type="file"])
 * @param maxSizeMB Maximum allowed size in MB
 * @returns { valid: boolean, message?: string }
 */

export const validateFileSize = (file: File, maxSizeMB: number) => {
    const sizeMB = bytesToMB(file.size);
    if (sizeMB > maxSizeMB) {
        return {
            valid: false,
            message: `Bannar images optical dimension 1520x400. Supported format JPEG, PNG. Max photo size ${maxSizeMB}MB. Current size: ${sizeMB.toFixed(2)}MB`,
        };
    }
    return { valid: true };
};
  