package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Entity(tableName = "suppliers")
@Serializable
data class SupplierEntity(
    @PrimaryKey val id: String,
    val supplierId: String,
    val name: String,
    val supplierType: String = "Center", // Center, Gavali, Gotha
    val mobile: String = "",
    val address: String = "",
    val routeId: String = "",
    val operatorName: String = "",
    val spaceOwnership: String = "Self", // Self, Rented
    val hygieneGrade: String = "A",
    val cowQty: Double = 0.0,
    val cowFat: Double = 0.0,
    val cowSnf: Double = 0.0,
    val bufQty: Double = 0.0,
    val bufFat: Double = 0.0,
    val bufSnf: Double = 0.0,
    val iceBlocks: Int = 0,
    val milkCansCount: Int = 0,
    val cattleFeedBrand: String = "",
    val competition: String = "",
    val scaleBrand: String = "",
    val fatMachineBrand: String = "",
    val chemicalsStock: String = "",
    val batteryCondition: String = "",
    val computerAvailable: Boolean = false,
    val upsInverterAvailable: Boolean = false,
    val solarAvailable: Boolean = false,
    val fssaiNumber: String = "",
    val fssaiExpiry: String = "",
    val adulterationKitInfo: String = "",
    val additionalNotes: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "quality_monitoring")
@Serializable
data class QualityMonitoringEntity(
    @PrimaryKey val id: String,
    val supplierType: String = "Gavali",
    val supplierName: String,
    val villageName: String,
    val chillingCenterName: String = "",
    val observationDate: String,
    val reason: String, // 'Repeated Adulteration', 'Excessive Odor', etc.
    val detailedRemarks: String = "",
    val status: String = "Active", // Active, Resolved
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "routes")
@Serializable
data class RouteEntity(
    @PrimaryKey val id: String,
    val name: String,
    val vehicle: String = "",
    val distanceKm: Double = 0.0,
    val costPerKm: Double = 0.0,
    val supplierCount: Int = 0,
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "daily_reports")
@Serializable
data class DailyReportEntity(
    @PrimaryKey val id: String,
    val type: String, // "Route Visit", "Field Visit", "Daily Office Work", "Collection Center Audit", "Transport Breakdown Report", "Seizure & Fine Report", "Custom Form"
    val heading: String,
    val reportDate: String,
    val summary: String,
    val shift: String = "सकाळ",
    val slipNo: String = "",
    val vehicleNo: String = "",
    val driverName: String = "",
    val routeName: String = "",
    val visitPerson: String = "",
    val visitPurpose: String = "",
    val visitDiscussion: String = "",
    val officeTaskSubject: String = "",
    val officeTaskDetails: String = "",
    val achievements: String = "",
    val problems: String = "",
    val actionsTaken: String = "",
    val supervisorName: String = "",
    val totalLossAmount: Double = 0.0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "work_tasks")
@Serializable
data class WorkTaskEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String = "",
    val assignedTo: String = "Procurement Manager",
    val status: String = "pending", // pending, completed
    val createdAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null
)

@Entity(tableName = "custom_forms")
@Serializable
data class CustomFormEntity(
    @PrimaryKey val id: String,
    val title: String,
    val fieldsJson: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "user_profile")
@Serializable
data class UserProfileEntity(
    @PrimaryKey val id: String = "current_user",
    val displayName: String = "प्रथमेष मोरे",
    val employeeId: String = "EMP-949",
    val email: String = "prathameshmore949@gmail.com",
    val permissionPhotoBase64: String? = null,
    val updatedAt: Long = System.currentTimeMillis()
)
