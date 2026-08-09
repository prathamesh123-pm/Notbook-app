package com.example.ui.navigation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.example.ui.AppViewModel
import com.example.ui.screens.*
import kotlinx.coroutines.launch

data class AppMenuItem(
    val route: String,
    val marathiTitle: String,
    val englishSubtitle: String,
    val icon: ImageVector,
    val badgeText: String? = null
)

val allNavMenuItems = listOf(
    AppMenuItem("dashboard", "डॅशबोर्ड", "Overview", Icons.Default.Dashboard),
    AppMenuItem("daily_report", "दैनिक अहवाल", "Report", Icons.Default.Assignment),
    AppMenuItem("work_log", "कामकाज नोंद", "Tasks", Icons.Default.Task, "3"),
    AppMenuItem("special_reports", "ERP रिपोर्ट", "ERP Report", Icons.Default.Analytics),
    AppMenuItem("suppliers", "सप्लायर मास्टर", "Master List", Icons.Default.Group),
    AppMenuItem("chilling_centers", "चिलिंग सेंटर", "Chilling Units", Icons.Default.AcUnit),
    AppMenuItem("centers", "संकलन केंद्र", "Centers", Icons.Default.Warehouse),
    AppMenuItem("routes", "रूट माहिती", "Routes", Icons.Default.Route),
    AppMenuItem("reports_archive", "अहवाल पहा", "Archive", Icons.Default.Folder),
    AppMenuItem("form_builder", "फॉर्म बिल्डर", "Word Editor", Icons.Default.EditNote),
    AppMenuItem("profile", "प्रोफाईल", "Profile", Icons.Default.Person),
    AppMenuItem("quality", "गुणवत्ता नमुना", "Quality", Icons.Default.Verified)
)

val bottomQuickNavItems = listOf(
    AppMenuItem("dashboard", "डॅशबोर्ड", "Overview", Icons.Default.Dashboard),
    AppMenuItem("centers", "सेंटर्स", "Centers", Icons.Default.Warehouse),
    AppMenuItem("daily_report", "अहवाल", "Report", Icons.Default.Assignment),
    AppMenuItem("work_log", "कामकाज", "Tasks", Icons.Default.Task),
    AppMenuItem("profile", "प्रोफाईल", "Profile", Icons.Default.Person)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppNavigation(viewModel: AppViewModel) {
    val navController = rememberNavController()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "dashboard"

    val configuration = LocalConfiguration.current
    val isTabletOrDesktop = configuration.screenWidthDp >= 840

    var showNotificationDialog by remember { mutableStateOf(false) }
    var showUniversalSearchDialog by remember { mutableStateOf(false) }

    val drawerContent = @Composable {
        ModalDrawerSheet(
            drawerContainerColor = MaterialTheme.colorScheme.surface,
            drawerShape = RoundedCornerShape(topEnd = 24.dp, bottomEnd = 24.dp),
            modifier = Modifier.width(300.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Header Brand Section
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.WaterDrop,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Column {
                            Text(
                                text = "संकलन नोंदवही",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            Text(
                                text = "Daily Register App",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))

                // Menu Items List
                Text(
                    text = "मुख्य नेव्हिगेशन मेनू (NAVIGATION)",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    letterSpacing = 0.5.sp,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )

                allNavMenuItems.forEach { item ->
                    val selected = currentRoute == item.route
                    NavigationDrawerItem(
                        label = {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = item.marathiTitle,
                                        fontSize = 13.sp,
                                        fontWeight = if (selected) FontWeight.Black else FontWeight.Bold
                                    )
                                    Text(
                                        text = item.englishSubtitle,
                                        fontSize = 9.sp,
                                        color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                item.badgeText?.let { badge ->
                                    Surface(
                                        color = MaterialTheme.colorScheme.error,
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Text(
                                            text = badge,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                        },
                        icon = {
                            Icon(
                                item.icon,
                                contentDescription = item.marathiTitle,
                                tint = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        selected = selected,
                        onClick = {
                            coroutineScope.launch { drawerState.close() }
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("drawer_item_${item.route}")
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // App Version info footer
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "संकलन नोंदवही v1.0 • Offline Room DB",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = drawerContent,
        gesturesEnabled = true
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.WaterDrop,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "संकलन नोंदवही",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                            Text(
                                text = "Daily Register & Procurement System",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(
                            onClick = { coroutineScope.launch { drawerState.open() } },
                            modifier = Modifier.testTag("open_sidebar_drawer_button")
                        ) {
                            Icon(Icons.Default.Menu, contentDescription = "Open Sidebar Menu")
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = { showUniversalSearchDialog = true },
                            modifier = Modifier.testTag("universal_search_btn")
                        ) {
                            Icon(Icons.Default.Search, contentDescription = "Search")
                        }

                        BadgedBox(
                            badge = {
                                Badge(containerColor = MaterialTheme.colorScheme.error) {
                                    Text("3", fontSize = 9.sp)
                                }
                            }
                        ) {
                            IconButton(
                                onClick = { showNotificationDialog = true },
                                modifier = Modifier.testTag("notification_bell_btn")
                            ) {
                                Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            },
            bottomBar = {
                if (!isTabletOrDesktop) {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.surface,
                        elevation = 8.dp
                    ) {
                        bottomQuickNavItems.forEach { item ->
                            val selected = currentRoute == item.route
                            NavigationBarItem(
                                selected = selected,
                                onClick = {
                                    navController.navigate(item.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                                icon = { Icon(item.icon, contentDescription = item.marathiTitle) },
                                label = {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(
                                            text = item.marathiTitle,
                                            fontSize = 10.sp,
                                            fontWeight = if (selected) FontWeight.Black else FontWeight.Bold
                                        )
                                    }
                                },
                                modifier = Modifier.testTag("nav_${item.route}")
                            )
                        }
                    }
                }
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = "dashboard",
                modifier = Modifier.padding(innerPadding)
            ) {
                composable("dashboard") {
                    DashboardScreen(viewModel = viewModel, onNavigate = { route -> navController.navigate(route) })
                }
                composable("daily_report") {
                    DailyReportScreen(viewModel = viewModel, onReportSubmitted = { navController.navigate("reports_archive") })
                }
                composable("work_log") {
                    WorkLogScreen(viewModel = viewModel)
                }
                composable("special_reports") {
                    SpecializedReportsScreen(viewModel = viewModel, onNavigateToArchive = { navController.navigate("reports_archive") })
                }
                composable("suppliers") {
                    SuppliersScreen(viewModel = viewModel)
                }
                composable("chilling_centers") {
                    ChillingCenterScreen(viewModel = viewModel)
                }
                composable("centers") {
                    CentersScreen(viewModel = viewModel)
                }
                composable("routes") {
                    RoutesScreen(viewModel = viewModel)
                }
                composable("reports_archive") {
                    ReportsListScreen(viewModel = viewModel)
                }
                composable("form_builder") {
                    FormBuilderScreen(viewModel = viewModel)
                }
                composable("profile") {
                    ProfileScreen(viewModel = viewModel, onLogout = { navController.navigate("dashboard") })
                }
                composable("quality") {
                    QualityMonitoringScreen(viewModel = viewModel)
                }
            }
        }
    }

    if (showNotificationDialog) {
        NotificationPanelDialog(onDismiss = { showNotificationDialog = false })
    }

    if (showUniversalSearchDialog) {
        UniversalSearchDialog(
            viewModel = viewModel,
            onDismiss = { showUniversalSearchDialog = false },
            onNavigate = { route ->
                showUniversalSearchDialog = false
                navController.navigate(route)
            }
        )
    }
}

@Composable
fun NotificationPanelDialog(onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "सूचना फलक (NOTIFICATIONS)",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", modifier = Modifier.size(16.dp))
                    }
                }

                HorizontalDivider()

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    NotificationItemRow(
                        title = "नवीन दूध संकलन अपडेट",
                        desc = "रस्तापूर केंद्र १ मधून ८३० लिटर दूध संकलित झाले आहे.",
                        time = "१० मिनिटांपूर्वी",
                        color = Color(0xFF0284C7)
                    )
                    NotificationItemRow(
                        title = "गुणवत्ता अलर्ट (भेसळ धोका)",
                        desc = "सुनील शिंदे (गवळी) यांच्या दुधात भेसळ संशय आढळला.",
                        time = "३० मिनिटांपूर्वी",
                        color = Color(0xFFDC2626)
                    )
                    NotificationItemRow(
                        title = "कामकाज स्मरणपत्र",
                        desc = "FSSAI लायसन्स नूतनीकरण अर्ज सादर करण्याची अंतिम तारीख जवळ आहे.",
                        time = "२ तासांपूर्वी",
                        color = Color(0xFFD97706)
                    )
                }

                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("समजले (Close)")
                }
            }
        }
    }
}

@Composable
fun NotificationItemRow(title: String, desc: String, time: String, color: Color) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(color.copy(alpha = 0.1f))
            .padding(10.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(color)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = color)
            Text(desc, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface)
            Text(time, fontSize = 8.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun UniversalSearchDialog(
    viewModel: AppViewModel,
    onDismiss: () -> Unit,
    onNavigate: (String) -> Unit
) {
    var query by remember { mutableStateOf("") }
    val suppliers by viewModel.suppliers.collectAsStateWithLifecycle()
    val routes by viewModel.routes.collectAsStateWithLifecycle()
    val reports by viewModel.reports.collectAsStateWithLifecycle()

    val filteredSuppliers = suppliers.filter { query.isNotBlank() && it.name.contains(query, ignoreCase = true) }
    val filteredRoutes = routes.filter { query.isNotBlank() && it.name.contains(query, ignoreCase = true) }
    val filteredReports = reports.filter { query.isNotBlank() && (it.heading.contains(query, ignoreCase = true) || it.summary.contains(query, ignoreCase = true)) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    placeholder = { Text("ॲपमध्ये काहीही शोधा (केंद्र, रूट, अहवाल)...", fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                if (query.isBlank()) {
                    Box(modifier = Modifier.padding(20.dp), contentAlignment = Alignment.Center) {
                        Text("शोधासाठी शब्द टाईप करा...", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 300.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (filteredSuppliers.isNotEmpty()) {
                            item { Text("संकलन केंद्रे / सप्लायर्स", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) }
                            items(filteredSuppliers) { supplier ->
                                Surface(
                                    modifier = Modifier.fillMaxWidth().clickable { onNavigate("centers") },
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                ) {
                                    Text(supplier.name, fontSize = 12.sp, modifier = Modifier.padding(8.dp))
                                }
                            }
                        }

                        if (filteredRoutes.isNotEmpty()) {
                            item { Text("रूट्स", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) }
                            items(filteredRoutes) { route ->
                                Surface(
                                    modifier = Modifier.fillMaxWidth().clickable { onNavigate("routes") },
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                ) {
                                    Text(route.name, fontSize = 12.sp, modifier = Modifier.padding(8.dp))
                                }
                            }
                        }

                        if (filteredReports.isNotEmpty()) {
                            item { Text("अहवाल", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) }
                            items(filteredReports) { rep ->
                                Surface(
                                    modifier = Modifier.fillMaxWidth().clickable { onNavigate("reports_archive") },
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                ) {
                                    Text(rep.heading, fontSize = 12.sp, modifier = Modifier.padding(8.dp))
                                }
                            }
                        }

                        if (filteredSuppliers.isEmpty() && filteredRoutes.isEmpty() && filteredReports.isEmpty()) {
                            item {
                                Text("काहीही सापडले नाही.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(12.dp))
                            }
                        }
                    }
                }

                TextButton(onClick = onDismiss, modifier = Modifier.align(Alignment.End)) {
                    Text("बंद करा")
                }
            }
        }
    }
}
