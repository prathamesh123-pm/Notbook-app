package com.example.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface SupplierDao {
    @Query("SELECT * FROM suppliers ORDER BY name ASC")
    fun getAllSuppliers(): Flow<List<SupplierEntity>>

    @Query("SELECT * FROM suppliers WHERE supplierType = 'Center' ORDER BY name ASC")
    fun getCenters(): Flow<List<SupplierEntity>>

    @Query("SELECT * FROM suppliers WHERE routeId = :routeId ORDER BY name ASC")
    fun getSuppliersByRoute(routeId: String): Flow<List<SupplierEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSupplier(supplier: SupplierEntity)

    @Update
    suspend fun updateSupplier(supplier: SupplierEntity)

    @Query("DELETE FROM suppliers WHERE id = :id")
    suspend fun deleteSupplierById(id: String)
}

@Dao
interface QualityMonitoringDao {
    @Query("SELECT * FROM quality_monitoring ORDER BY createdAt DESC")
    fun getAllEntries(): Flow<List<QualityMonitoringEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEntry(entry: QualityMonitoringEntity)

    @Update
    suspend fun updateEntry(entry: QualityMonitoringEntity)

    @Query("DELETE FROM quality_monitoring WHERE id = :id")
    suspend fun deleteEntryById(id: String)
}

@Dao
interface RouteDao {
    @Query("SELECT * FROM routes ORDER BY name ASC")
    fun getAllRoutes(): Flow<List<RouteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoute(route: RouteEntity)

    @Query("DELETE FROM routes WHERE id = :id")
    suspend fun deleteRouteById(id: String)
}

@Dao
interface DailyReportDao {
    @Query("SELECT * FROM daily_reports ORDER BY createdAt DESC")
    fun getAllReports(): Flow<List<DailyReportEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReport(report: DailyReportEntity)

    @Query("DELETE FROM daily_reports WHERE id = :id")
    suspend fun deleteReportById(id: String)
}

@Dao
interface WorkTaskDao {
    @Query("SELECT * FROM work_tasks ORDER BY createdAt DESC")
    fun getAllTasks(): Flow<List<WorkTaskEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: WorkTaskEntity)

    @Update
    suspend fun updateTask(task: WorkTaskEntity)

    @Query("DELETE FROM work_tasks WHERE id = :id")
    suspend fun deleteTaskById(id: String)
}

@Dao
interface CustomFormDao {
    @Query("SELECT * FROM custom_forms ORDER BY createdAt DESC")
    fun getAllForms(): Flow<List<CustomFormEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertForm(form: CustomFormEntity)

    @Query("DELETE FROM custom_forms WHERE id = :id")
    suspend fun deleteFormById(id: String)
}

@Dao
interface UserProfileDao {
    @Query("SELECT * FROM user_profile WHERE id = 'current_user' LIMIT 1")
    fun getUserProfile(): Flow<UserProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateProfile(profile: UserProfileEntity)
}
