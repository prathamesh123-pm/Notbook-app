package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.RouteEntity
import com.example.data.SupplierEntity
import com.example.ui.AppViewModel
import java.util.UUID

import com.example.ui.components.BreadcrumbNav

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoutesScreen(viewModel: AppViewModel) {
    val routes by viewModel.routes.collectAsStateWithLifecycle()
    val suppliers by viewModel.suppliers.collectAsStateWithLifecycle()

    var showAddDialog by remember { mutableStateOf(false) }
    var selectedRouteForDetails by remember { mutableStateOf<RouteEntity?>(null) }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddDialog = true },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("नवीन रूट", fontWeight = FontWeight.Bold) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                modifier = Modifier.testTag("add_route_fab")
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Breadcrumb
            BreadcrumbNav(
                currentPageTitleMarathi = "रूट माहिती",
                currentPageTitleEnglish = "Route Logistics & Vehicles"
            )

            // Title
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "संकलन मार्ग (ROUTES)",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "वाहन, अंतर आणि भाडे व्यवस्थापन",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "${routes.size} मार्ग",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }

            // Routes List
            if (routes.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text("एकही रूट उपलब्ध नाही", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(routes) { route ->
                        val routeSuppliers = suppliers.filter { it.routeId == route.id }
                        RouteItemCard(
                            route = route,
                            assignedCount = routeSuppliers.size,
                            onClick = { selectedRouteForDetails = route },
                            onDelete = { viewModel.deleteRoute(route.id) }
                        )
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddRouteDialog(
            onDismiss = { showAddDialog = false },
            onSave = { route ->
                viewModel.saveRoute(route)
                showAddDialog = false
            }
        )
    }

    selectedRouteForDetails?.let { route ->
        val routeSuppliers = suppliers.filter { it.routeId == route.id }
        RouteDetailDialog(
            route = route,
            assignedSuppliers = routeSuppliers,
            onDismiss = { selectedRouteForDetails = null }
        )
    }
}

@Composable
fun RouteItemCard(
    route: RouteEntity,
    assignedCount: Int,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    ElevatedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Route,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column {
                        Text(
                            text = route.name,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "वाहन: ${route.vehicle.ifBlank { "-" }}",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("एकूण अंतर", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${route.distanceKm} KM", fontSize = 11.sp, fontWeight = FontWeight.Black)
                }
                Column {
                    Text("दर / KM", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("₹${route.costPerKm}", fontSize = 11.sp, fontWeight = FontWeight.Black)
                }
                Column {
                    Text("जोडलेले सेंटर्स", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("$assignedCount सप्लायर्स", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

@Composable
fun AddRouteDialog(
    onDismiss: () -> Unit,
    onSave: (RouteEntity) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var vehicle by remember { mutableStateOf("") }
    var distance by remember { mutableStateOf("") }
    var costPerKm by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("नवीन रूट जोडा", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)

                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("रूटचे नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = vehicle, onValueChange = { vehicle = it },
                    label = { Text("नियुक्त वाहन (उदा. टाटा एस MH 16 CA 1024)") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = distance, onValueChange = { distance = it },
                        label = { Text("अंतर (KM)") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = costPerKm, onValueChange = { costPerKm = it },
                        label = { Text("दर (₹ / KM)") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) { Text("रद्द करा") }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val route = RouteEntity(
                                id = UUID.randomUUID().toString(),
                                name = name,
                                vehicle = vehicle,
                                distanceKm = distance.toDoubleOrNull() ?: 0.0,
                                costPerKm = costPerKm.toDoubleOrNull() ?: 0.0
                            )
                            onSave(route)
                        },
                        enabled = name.isNotBlank()
                    ) {
                        Text("जतन करा")
                    }
                }
            }
        }
    }
}

@Composable
fun RouteDetailDialog(
    route: RouteEntity,
    assignedSuppliers: List<SupplierEntity>,
    onDismiss: () -> Unit
) {
    val totalCowMilk = assignedSuppliers.sumOf { it.cowQty }
    val totalBufMilk = assignedSuppliers.sumOf { it.bufQty }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(route.name, fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                Text("वाहन: ${route.vehicle.ifBlank { "-" }} | अंतर: ${route.distanceKm} KM", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

                HorizontalDivider()

                Text("एकूण संकलित दूध:", fontSize = 11.sp, fontWeight = FontWeight.Black)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("गाय: %.1f Liters".format(totalCowMilk), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("म्हैस: %.1f Liters".format(totalBufMilk), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(6.dp))
                Text("जोडलेले सेंटर्स व गवळी (${assignedSuppliers.size}):", fontSize = 11.sp, fontWeight = FontWeight.Black)

                if (assignedSuppliers.isEmpty()) {
                    Text("या रूटवर एकही सप्लायर जोडलेला नाही.", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                } else {
                    assignedSuppliers.forEach { supp ->
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(supp.name, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Text("${supp.cowQty + supp.bufQty} L", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }

                Button(onClick = onDismiss, modifier = Modifier.align(Alignment.End)) {
                    Text("बंद करा")
                }
            }
        }
    }
}
