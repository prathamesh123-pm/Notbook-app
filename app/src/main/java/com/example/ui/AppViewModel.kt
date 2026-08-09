package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: AppRepository

    val suppliers: StateFlow<List<SupplierEntity>>
    val centers: StateFlow<List<SupplierEntity>>
    val qualityEntries: StateFlow<List<QualityMonitoringEntity>>
    val routes: StateFlow<List<RouteEntity>>
    val reports: StateFlow<List<DailyReportEntity>>
    val tasks: StateFlow<List<WorkTaskEntity>>
    val forms: StateFlow<List<CustomFormEntity>>
    val userProfile: StateFlow<UserProfileEntity?>

    init {
        val database = AppDatabase.getDatabase(application)
        repository = AppRepository(database)

        suppliers = repository.allSuppliers.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        centers = repository.centers.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        qualityEntries = repository.qualityMonitoringEntries.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        routes = repository.allRoutes.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        reports = repository.allReports.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        tasks = repository.allTasks.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        forms = repository.allForms.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
        )
        userProfile = repository.userProfile.stateIn(
            viewModelScope, SharingStarted.WhileSubscribed(5000), null
        )
    }

    // Supplier / Center Actions
    fun saveSupplier(supplier: SupplierEntity) = viewModelScope.launch {
        repository.insertSupplier(supplier)
    }

    fun updateSupplier(supplier: SupplierEntity) = viewModelScope.launch {
        repository.updateSupplier(supplier)
    }

    fun deleteSupplier(id: String) = viewModelScope.launch {
        repository.deleteSupplier(id)
    }

    // Quality Monitoring Actions
    fun saveQualityEntry(entry: QualityMonitoringEntity) = viewModelScope.launch {
        repository.insertQualityEntry(entry)
    }

    fun updateQualityEntry(entry: QualityMonitoringEntity) = viewModelScope.launch {
        repository.updateQualityEntry(entry)
    }

    fun deleteQualityEntry(id: String) = viewModelScope.launch {
        repository.deleteQualityEntry(id)
    }

    // Route Actions
    fun saveRoute(route: RouteEntity) = viewModelScope.launch {
        repository.insertRoute(route)
    }

    fun deleteRoute(id: String) = viewModelScope.launch {
        repository.deleteRoute(id)
    }

    // Report Actions
    fun saveReport(report: DailyReportEntity) = viewModelScope.launch {
        repository.insertReport(report)
    }

    fun deleteReport(id: String) = viewModelScope.launch {
        repository.deleteReport(id)
    }

    // Task Actions
    fun saveTask(task: WorkTaskEntity) = viewModelScope.launch {
        repository.insertTask(task)
    }

    fun toggleTaskStatus(taskId: String, currentStatus: String) = viewModelScope.launch {
        val newStatus = if (currentStatus == "completed") "pending" else "completed"
        val completedAt = if (newStatus == "completed") System.currentTimeMillis() else null
        val task = tasks.value.find { it.id == taskId }
        task?.let {
            repository.updateTask(it.copy(status = newStatus, completedAt = completedAt))
        }
    }

    fun deleteTask(id: String) = viewModelScope.launch {
        repository.deleteTask(id)
    }

    // Custom Form Actions
    fun saveForm(form: CustomFormEntity) = viewModelScope.launch {
        repository.insertForm(form)
    }

    fun deleteForm(id: String) = viewModelScope.launch {
        repository.deleteForm(id)
    }

    // User Profile Actions
    fun saveProfile(profile: UserProfileEntity) = viewModelScope.launch {
        repository.saveUserProfile(profile)
    }
}
