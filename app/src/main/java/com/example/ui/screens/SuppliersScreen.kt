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
import com.example.data.SupplierEntity
import com.example.ui.AppViewModel
import java.util.UUID

import com.example.ui.components.BreadcrumbNav

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SuppliersScreen(viewModel: AppViewModel) {
    val suppliers by viewModel.suppliers.collectAsStateWithLifecycle()
    val routes by viewModel.routes.collectAsStateWithLifecycle()

    var searchQuery by remember { mutableStateOf("") }
    var selectedTypeFilter by remember { mutableStateOf("सर्व") }
    var showAddDialog by remember { mutableStateOf(false) }
    var editingSupplier by remember { mutableStateOf<SupplierEntity?>(null) }

    val typesList = listOf("सर्व", "Center", "Gavali", "Gotha")

    val filteredSuppliers = suppliers.filter { item ->
        (selectedTypeFilter == "सर्व" || item.supplierType == selectedTypeFilter) &&
                (item.name.contains(searchQuery, ignoreCase = true) ||
                        item.supplierId.contains(searchQuery, ignoreCase = true) ||
                        item.mobile.contains(searchQuery) ||
                        item.address.contains(searchQuery, ignoreCase = true))
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = {
                    editingSupplier = null
                    showAddDialog = true
                },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("नवीन सप्लायर", fontWeight = FontWeight.Bold) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                modifier = Modifier.testTag("add_supplier_fab")
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
                currentPageTitleMarathi = "सप्लायर मास्टर",
                currentPageTitleEnglish = "Master Supplier List"
            )

            // Title
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "दूध उत्पादक व सप्लायर्स (SUPPLIERS)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "गवळी, गोठा आणि संकलन केंद्र डेटाबेस",
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
                        text = "${filteredSuppliers.size} सप्लायर्स",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }

            // Search
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("नाव, आयडी किंवा मोबाईल शोधा...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Type Filter
            ScrollableTabRow(
                selectedTabIndex = typesList.indexOf(selectedTypeFilter).coerceAtLeast(0),
                edgePadding = 0.dp,
                divider = {}
            ) {
                typesList.forEach { type ->
                    Tab(
                        selected = selectedTypeFilter == type,
                        onClick = { selectedTypeFilter = type },
                        text = {
                            Text(
                                text = when (type) {
                                    "Center" -> "संकलन केंद्र"
                                    "Gavali" -> "गवळी"
                                    "Gotha" -> "गोठा"
                                    else -> "सर्व प्रकार"
                                },
                                fontSize = 11.sp,
                                fontWeight = if (selectedTypeFilter == type) FontWeight.Black else FontWeight.Medium
                            )
                        }
                    )
                }
            }

            // List
            if (filteredSuppliers.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text("एकही सप्लायर सापडला नाही", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredSuppliers) { supplier ->
                        val routeName = routes.find { it.id == supplier.routeId }?.name ?: "रूट नाही"
                        SupplierCardItem(
                            supplier = supplier,
                            routeName = routeName,
                            onEdit = {
                                editingSupplier = supplier
                                showAddDialog = true
                            },
                            onDelete = { viewModel.deleteSupplier(supplier.id) }
                        )
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddEditSupplierDialog(
            initialSupplier = editingSupplier,
            routes = routes.map { Pair(it.id, it.name) },
            onDismiss = { showAddDialog = false },
            onSave = { supplier ->
                if (editingSupplier == null) {
                    viewModel.saveSupplier(supplier)
                } else {
                    viewModel.updateSupplier(supplier)
                }
                showAddDialog = false
            }
        )
    }
}

@Composable
fun SupplierCardItem(
    supplier: SupplierEntity,
    routeName: String,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    ElevatedCard(
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = supplier.name,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "प्रकार: ${supplier.supplierType} | आयडी: ${supplier.supplierId}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Row {
                    IconButton(onClick = onEdit, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("मोबाईल", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(supplier.mobile.ifBlank { "-" }, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
                Column {
                    Text("रूट", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(routeName, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
                Column {
                    Text("दूध प्रमाण", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("%.1f L".format(supplier.cowQty + supplier.bufQty), fontSize = 10.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

@Composable
fun AddEditSupplierDialog(
    initialSupplier: SupplierEntity?,
    routes: List<Pair<String, String>>,
    onDismiss: () -> Unit,
    onSave: (SupplierEntity) -> Unit
) {
    var name by remember { mutableStateOf(initialSupplier?.name ?: "") }
    var code by remember { mutableStateOf(initialSupplier?.supplierId ?: "") }
    var type by remember { mutableStateOf(initialSupplier?.supplierType ?: "Gavali") }
    var mobile by remember { mutableStateOf(initialSupplier?.mobile ?: "") }
    var address by remember { mutableStateOf(initialSupplier?.address ?: "") }
    var selectedRouteId by remember { mutableStateOf(initialSupplier?.routeId ?: (routes.firstOrNull()?.first ?: "")) }
    var cowQty by remember { mutableStateOf(initialSupplier?.cowQty?.toString() ?: "0") }
    var bufQty by remember { mutableStateOf(initialSupplier?.bufQty?.toString() ?: "0") }

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
                Text(
                    text = if (initialSupplier == null) "नवीन सप्लायर जोडा" else "सप्लायर माहिती अपडेट करा",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )

                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("सप्लायरचे नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = code, onValueChange = { code = it },
                        label = { Text("सप्लायर आयडी") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = mobile, onValueChange = { mobile = it },
                        label = { Text("मोबाईल नंबर") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                }

                Text("प्रकार निवडा:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    listOf("Gavali" to "गवळी", "Gotha" to "गोठा", "Center" to "सेंटर").forEach { (valType, label) ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(selected = type == valType, onClick = { type = valType })
                            Text(label, fontSize = 11.sp)
                        }
                    }
                }

                OutlinedTextField(
                    value = address, onValueChange = { address = it },
                    label = { Text("पत्ता / गाव") }, modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = cowQty, onValueChange = { cowQty = it },
                        label = { Text("गाय दूध (L)") }, modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = bufQty, onValueChange = { bufQty = it },
                        label = { Text("म्हैस दूध (L)") }, modifier = Modifier.weight(1f)
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
                            val supplier = SupplierEntity(
                                id = initialSupplier?.id ?: UUID.randomUUID().toString(),
                                supplierId = code.ifBlank { "SUP-${(1000..9999).random()}" },
                                name = name,
                                supplierType = type,
                                mobile = mobile,
                                address = address,
                                routeId = selectedRouteId,
                                cowQty = cowQty.toDoubleOrNull() ?: 0.0,
                                bufQty = bufQty.toDoubleOrNull() ?: 0.0
                            )
                            onSave(supplier)
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
