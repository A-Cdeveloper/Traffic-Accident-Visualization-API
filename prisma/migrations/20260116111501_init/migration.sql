-- CreateTable
CREATE TABLE `traffic_accidents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accident_id` INTEGER NOT NULL,
    `pdepartment` VARCHAR(191) NOT NULL,
    `pstation` VARCHAR(191) NOT NULL,
    `date_time` DATETIME(3) NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `accident_type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `traffic_accidents_accident_id_key`(`accident_id`),
    INDEX `traffic_accidents_accident_id_idx`(`accident_id`),
    INDEX `traffic_accidents_pdepartment_idx`(`pdepartment`),
    INDEX `traffic_accidents_pstation_idx`(`pstation`),
    INDEX `traffic_accidents_date_time_idx`(`date_time`),
    INDEX `traffic_accidents_pstation_date_time_idx`(`pstation`, `date_time`),
    INDEX `traffic_accidents_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
