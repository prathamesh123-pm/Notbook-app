package com.example.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        SupplierEntity::class,
        QualityMonitoringEntity::class,
        RouteEntity::class,
        DailyReportEntity::class,
        WorkTaskEntity::class,
        CustomFormEntity::class,
        UserProfileEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun supplierDao(): SupplierDao
    abstract fun qualityMonitoringDao(): QualityMonitoringDao
    abstract fun routeDao(): RouteDao
    abstract fun dailyReportDao(): DailyReportDao
    abstract fun workTaskDao(): WorkTaskDao
    abstract fun customFormDao(): CustomFormDao
    abstract fun userProfileDao(): UserProfileDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "procurement_notebook.db"
                )
                    .addCallback(DatabaseCallback())
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        populateInitialData(database)
                    }
                }
            }
        }

        private suspend fun populateInitialData(database: AppDatabase) {
            // Seed Routes
            val route1 = RouteEntity(
                id = "route-1",
                name = "रस्तापूर रूट",
                vehicle = "टाटा एस (MH 16 CA 1024)",
                distanceKm = 42.5,
                costPerKm = 12.0,
                supplierCount = 4
            )
            val route2 = RouteEntity(
                id = "route-2",
                name = "संगमनेर रूट",
                vehicle = "बोलेरो पिकअप (MH 17 BD 2048)",
                distanceKm = 38.0,
                costPerKm = 14.5,
                supplierCount = 3
            )
            database.routeDao().insertRoute(route1)
            database.routeDao().insertRoute(route2)

            // Seed Suppliers / Centers
            val center1 = SupplierEntity(
                id = "center-101",
                supplierId = "C-101",
                name = "आनंद दूध संकलन केंद्र, रस्तापूर",
                supplierType = "Center",
                mobile = "9822114455",
                address = "रस्तापूर, ता. नेवासा",
                routeId = "route-1",
                operatorName = "रमेश पाटील",
                cowQty = 450.0,
                cowFat = 3.8,
                cowSnf = 8.5,
                bufQty = 320.0,
                bufFat = 6.8,
                bufSnf = 9.0,
                iceBlocks = 5,
                milkCansCount = 20,
                fssaiNumber = "21521034000123",
                fssaiExpiry = "2027-12-31",
                hygieneGrade = "A+",
                scaleBrand = "Essae 300kg",
                fatMachineBrand = "Lactoscan SP",
                computerAvailable = true,
                upsInverterAvailable = true,
                solarAvailable = false
            )
            val center2 = SupplierEntity(
                id = "center-102",
                supplierId = "C-102",
                name = "जय भवानी डेअरी सेंटर, शिंगणापूर",
                supplierType = "Center",
                mobile = "9890123456",
                address = "शिंगणापूर, ता. राहता",
                routeId = "route-1",
                operatorName = "बाळासाहेब काळे",
                cowQty = 380.0,
                cowFat = 3.9,
                cowSnf = 8.6,
                bufQty = 290.0,
                bufFat = 7.1,
                bufSnf = 9.1,
                iceBlocks = 4,
                milkCansCount = 15,
                fssaiNumber = "21522045000567",
                fssaiExpiry = "2026-10-15",
                hygieneGrade = "A",
                scaleBrand = "Avery Berkel",
                fatMachineBrand = "Funke Gerber",
                computerAvailable = true,
                upsInverterAvailable = true,
                solarAvailable = true
            )
            val supplier1 = SupplierEntity(
                id = "supp-201",
                supplierId = "G-201",
                name = "ज्ञानदेव गवळी (मोठा गोठा)",
                supplierType = "Gotha",
                mobile = "9423456789",
                address = "वाकडी, ता. राहता",
                routeId = "route-2",
                operatorName = "ज्ञानदेव गवळी",
                cowQty = 280.0,
                cowFat = 3.7,
                cowSnf = 8.4,
                bufQty = 150.0,
                bufFat = 6.5,
                bufSnf = 8.9,
                fssaiNumber = "21523089000888",
                fssaiExpiry = "2028-05-20"
            )

            database.supplierDao().insertSupplier(center1)
            database.supplierDao().insertSupplier(center2)
            database.supplierDao().insertSupplier(supplier1)

            // Seed Quality Monitoring
            val qm1 = QualityMonitoringEntity(
                id = "qm-1",
                supplierType = "Gavali",
                supplierName = "सुनील शिंदे (गवळी)",
                villageName = "रस्तापूर",
                chillingCenterName = "रस्तापूर चिलिंग सेंटर",
                observationDate = "2026-08-07",
                reason = "Repeated Adulteration",
                detailedRemarks = "वारंवार दुधामध्ये पाणी आणि स्टार्चची भेसळ आढळली. अंतिम इशारा देण्यात आला.",
                status = "Active"
            )
            val qm2 = QualityMonitoringEntity(
                id = "qm-2",
                supplierType = "Gotha",
                supplierName = "मारुती फार्म्स गोठा",
                villageName = "शिंगणापूर",
                chillingCenterName = "शिंगणापूर सेंटर",
                observationDate = "2026-08-06",
                reason = "Late Milk Arrival",
                detailedRemarks = "सकाळी ९:३० वाजेनंतर दूध पोहोचत असल्याने तापमानाचा फटका बसत आहे.",
                status = "Active"
            )
            database.qualityMonitoringDao().insertEntry(qm1)
            database.qualityMonitoringDao().insertEntry(qm2)

            // Seed Tasks
            val task1 = WorkTaskEntity(
                id = "task-1",
                title = "रस्तापूर केंद्राचे मासिक ऑडिट पूर्ण करणे",
                description = "दूध गुणवत्ता, कॅन स्वच्छता आणि इलेक्ट्रॉनिक वजन काट्याची तपासणी करणे.",
                status = "pending",
                createdAt = System.currentTimeMillis() - 86400000
            )
            val task2 = WorkTaskEntity(
                id = "task-2",
                title = "FSSAI लायसन्स नूतनीकरण अर्ज भरणे",
                description = "शिंगणापूर केंद्राचे लायसन्स अपडेट करणे.",
                status = "completed",
                createdAt = System.currentTimeMillis() - 172800000,
                completedAt = System.currentTimeMillis() - 86400000
            )
            database.workTaskDao().insertTask(task1)
            database.workTaskDao().insertTask(task2)

            // Seed Reports
            val rep1 = DailyReportEntity(
                id = "rep-1",
                type = "Route Visit",
                heading = "दैनिक रूट भेट - रस्तापूर मार्ग",
                reportDate = "2026-08-08",
                summary = "एकूण ४ केंद्रांना भेट दिली. संकलन सुरळीत पार पडले.",
                shift = "सकाळ",
                vehicleNo = "MH 16 CA 1024",
                driverName = "संजय पवार",
                routeName = "रस्तापूर रूट",
                achievements = "वेळेवर ८३० लिटर दूध संकलित झाले.",
                problems = "रस्त्याची दुर्दशा असल्याने गाडीला १० मिनिटे उशीर झाला.",
                actionsTaken = "ड्रायव्हरला पर्यायी मार्ग वापरण्यास सांगितले.",
                supervisorName = "प्रथमेष मोरे"
            )
            database.dailyReportDao().insertReport(rep1)

            // Seed User Profile
            val profile = UserProfileEntity(
                id = "current_user",
                displayName = "प्रथमेष मोरे",
                employeeId = "EMP-949",
                email = "prathameshmore949@gmail.com"
            )
            database.userProfileDao().insertOrUpdateProfile(profile)
        }
    }
}
