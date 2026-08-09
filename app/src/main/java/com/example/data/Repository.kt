package com.example.data

import kotlinx.coroutines.flow.Flow

class AppRepository(private val db: AppDatabase) {

    // Suppliers & Centers
    val allSuppliers: Flow<List<SupplierEntity>> = db.supplierDao().getAllSuppliers()
    val centers: Flow<List<SupplierEntity>> = db.supplierDao().getCenters()

    fun getSuppliersByRoute(routeId: String): Flow<List<SupplierEntity>> =
        db.supplierDao().getSuppliersByRoute(routeId)

    suspend fun insertSupplier(supplier: SupplierEntity) =
        db.supplierDao().insertSupplier(supplier)

    suspend fun updateSupplier(supplier: SupplierEntity) =
        db.supplierDao().updateSupplier(supplier)

    suspend fun deleteSupplier(id: String) =
        db.supplierDao().deleteSupplierById(id)

    // Quality Monitoring
    val qualityMonitoringEntries: Flow<List<QualityMonitoringEntity>> =
        db.qualityMonitoringDao().getAllEntries()

    suspend fun insertQualityEntry(entry: QualityMonitoringEntity) =
        db.qualityMonitoringDao().insertEntry(entry)

    suspend fun updateQualityEntry(entry: QualityMonitoringEntity) =
        db.qualityMonitoringDao().updateEntry(entry)

    suspend fun deleteQualityEntry(id: String) =
        db.qualityMonitoringDao().deleteEntryById(id)

    // Routes
    val allRoutes: Flow<List<RouteEntity>> = db.routeDao().getAllRoutes()

    suspend fun insertRoute(route: RouteEntity) =
        db.routeDao().insertRoute(route)

    suspend fun deleteRoute(id: String) =
        db.routeDao().deleteRouteById(id)

    // Daily Reports
    val allReports: Flow<List<DailyReportEntity>> = db.dailyReportDao().getAllReports()

    suspend fun insertReport(report: DailyReportEntity) =
        db.dailyReportDao().insertReport(report)

    suspend fun deleteReport(id: String) =
        db.dailyReportDao().deleteReportById(id)

    // Work Tasks
    val allTasks: Flow<List<WorkTaskEntity>> = db.workTaskDao().getAllTasks()

    suspend fun insertTask(task: WorkTaskEntity) =
        db.workTaskDao().insertTask(task)

    suspend fun updateTask(task: WorkTaskEntity) =
        db.workTaskDao().updateTask(task)

    suspend fun deleteTask(id: String) =
        db.workTaskDao().deleteTaskById(id)

    // Custom Forms
    val allForms: Flow<List<CustomFormEntity>> = db.customFormDao().getAllForms()

    suspend fun insertForm(form: CustomFormEntity) =
        db.customFormDao().insertForm(form)

    suspend fun deleteForm(id: String) =
        db.customFormDao().deleteFormById(id)

    // User Profile
    val userProfile: Flow<UserProfileEntity?> = db.userProfileDao().getUserProfile()

    suspend fun saveUserProfile(profile: UserProfileEntity) =
        db.userProfileDao().insertOrUpdateProfile(profile)
}
