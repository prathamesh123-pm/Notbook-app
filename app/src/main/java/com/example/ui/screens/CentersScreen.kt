package com.example.ui.screens

import androidx.compose.foundation.background
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
fun CentersScreen(viewModel: AppViewModel) {
    val centers by viewModel.centers.collectAsStateWithLifecycle()
    val routes by viewModel.routes.collectAsStateWithLifecycle()

    var searchQuery by remember { mutableStateOf("") }
    var showAddDialog by remember { mutableStateOf(false) }
    var editingCenter by remember { mutableStateOf<SupplierEntity?>(null) }
    var selectedCenterForDetails by remember { mutableStateOf<SupplierEntity?>(null) }

    val filteredCenters = centers.filter {
        it.name.contains(searchQuery, ignoreCase = true) ||
                it.supplierId.contains(searchQuery, ignoreCase = true) ||
                it.address.contains(searchQuery, ignoreCase = true)
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = {
                    editingCenter = null
                    showAddDialog = true
                },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("नवीन केंद्र", fontWeight = FontWeight.Bold) },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                modifier = Modifier.testTag("add_center_fab")
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
                currentPageTitleMarathi = "संकलन केंद्र",
                currentPageTitleEnglish = "Collection Centers"
            )

            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "संकलन केंद्र (CENTERS)",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Profile & Inventory Management",
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
                        text = "${centers.size} सेंटर्स",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("search_centers_input"),
                placeholder = { Text("केंद्राचे नाव, आयडी किंवा पत्ता शोधा...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Centers List
            if (filteredCenters.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "एकही संकलन केंद्र सापडले नाही",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredCenters) { center ->
                        CenterItemCard(
                            center = center,
                            routeName = routes.find { it.id == center.routeId }?.name ?: "रूट नाही",
                            onClick = { selectedCenterForDetails = center },
                            onEdit = {
                                editingCenter = center
                                showAddDialog = true
                            },
                            onDelete = { viewModel.deleteSupplier(center.id) }
                        )
                    }
                }
            }
        }
    }

    // Add / Edit Dialog
    if (showAddDialog) {
        AddEditCenterDialog(
            initialCenter = editingCenter,
            routes = routes.map { Pair(it.id, it.name) },
            onDismiss = { showAddDialog = false },
            onSave = { center ->
                if (editingCenter == null) {
                    viewModel.saveSupplier(center)
                } else {
                    viewModel.updateSupplier(center)
                }
                showAddDialog = false
            }
        )
    }

    // Details Dialog
    selectedCenterForDetails?.let { center ->
        CenterDetailDialog(
            center = center,
            routeName = routes.find { it.id == center.routeId }?.name ?: "रूट नाही",
            onDismiss = { selectedCenterForDetails = null }
        )
    }
}

@Composable
fun CenterItemCard(
    center: SupplierEntity,
    routeName: String,
    onClick: () -> Unit,
    onEdit: () -> Unit,
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = center.name,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.primaryContainer,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = center.supplierId,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        Text(
                            text = routeName,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
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
                    Text("गाय दूध", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("%.1f L | FAT: %.1f | SNF: %.1f".format(center.cowQty, center.cowFat, center.cowSnf), fontSize = 10.sp, fontWeight = FontWeight.Black)
                }
                Column {
                    Text("म्हैस दूध", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("%.1f L | FAT: %.1f | SNF: %.1f".format(center.bufQty, center.bufFat, center.bufSnf), fontSize = 10.sp, fontWeight = FontWeight.Black)
                }
                Column {
                    Text("बर्फ blocks", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${center.iceBlocks} लाद्या", fontSize = 10.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

@Composable
fun AddEditCenterDialog(
    initialCenter: SupplierEntity?,
    routes: List<Pair<String, String>>,
    onDismiss: () -> Unit,
    onSave: (SupplierEntity) -> Unit
) {
    var name by remember { mutableStateOf(initialCenter?.name ?: "") }
    var code by remember { mutableStateOf(initialCenter?.supplierId ?: "") }
    var operator by remember { mutableStateOf(initialCenter?.operatorName ?: "") }
    var mobile by remember { mutableStateOf(initialCenter?.mobile ?: "") }
    var address by remember { mutableStateOf(initialCenter?.address ?: "") }
    var selectedRouteId by remember { mutableStateOf(initialCenter?.routeId ?: (routes.firstOrNull()?.first ?: "")) }
    var cowQty by remember { mutableStateOf(initialCenter?.cowQty?.toString() ?: "0") }
    var cowFat by remember { mutableStateOf(initialCenter?.cowFat?.toString() ?: "0") }
    var cowSnf by remember { mutableStateOf(initialCenter?.cowSnf?.toString() ?: "0") }
    var bufQty by remember { mutableStateOf(initialCenter?.bufQty?.toString() ?: "0") }
    var bufFat by remember { mutableStateOf(initialCenter?.bufFat?.toString() ?: "0") }
    var bufSnf by remember { mutableStateOf(initialCenter?.bufSnf?.toString() ?: "0") }
    var iceBlocks by remember { mutableStateOf(initialCenter?.iceBlocks?.toString() ?: "0") }
    var cansCount by remember { mutableStateOf(initialCenter?.milkCansCount?.toString() ?: "0") }
    var fssaiNo by remember { mutableStateOf(initialCenter?.fssaiNumber ?: "") }
    var fssaiExp by remember { mutableStateOf(initialCenter?.fssaiExpiry ?: "") }
    var scaleBrand by remember { mutableStateOf(initialCenter?.scaleBrand ?: "") }
    var fatMachine by remember { mutableStateOf(initialCenter?.fatMachineBrand ?: "") }
    var computer by remember { mutableStateOf(initialCenter?.computerAvailable ?: false) }
    var ups by remember { mutableStateOf(initialCenter?.upsInverterAvailable ?: false) }
    var solar by remember { mutableStateOf(initialCenter?.solarAvailable ?: false) }
    var notes by remember { mutableStateOf(initialCenter?.additionalNotes ?: "") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = if (initialCenter == null) "नवीन केंद्र जोडा" else "केंद्र माहिती संपादित करा",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )

                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("केंद्राचे नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = code, onValueChange = { code = it },
                        label = { Text("केंद्र कोड *") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = operator, onValueChange = { operator = it },
                        label = { Text("चालकाचे नाव") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = mobile, onValueChange = { mobile = it },
                        label = { Text("मोबाईल नं.") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = address, onValueChange = { address = it },
                        label = { Text("पत्ता / गाव") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                }

                Text("दूध संकलन तपशील", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(value = cowQty, onValueChange = { cowQty = it }, label = { Text("गाय L") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = cowFat, onValueChange = { cowFat = it }, label = { Text("Fat") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = cowSnf, onValueChange = { cowSnf = it }, label = { Text("SNF") }, modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedTextField(value = bufQty, onValueChange = { bufQty = it }, label = { Text("म्हैस L") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = bufFat, onValueChange = { bufFat = it }, label = { Text("Fat") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = bufSnf, onValueChange = { bufSnf = it }, label = { Text("SNF") }, modifier = Modifier.weight(1f))
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = iceBlocks, onValueChange = { iceBlocks = it }, label = { Text("बर्फ लाद्या") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = cansCount, onValueChange = { cansCount = it }, label = { Text("दूध कॅन नग") }, modifier = Modifier.weight(1f))
                }

                Text("इक्विपमेंट व FSSAI", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = scaleBrand, onValueChange = { scaleBrand = it }, label = { Text("वजन काटा") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = fatMachine, onValueChange = { fatMachine = it }, label = { Text("फॅट मशीन") }, modifier = Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = fssaiNo, onValueChange = { fssaiNo = it }, label = { Text("FSSAI नंबर") }, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = fssaiExp, onValueChange = { fssaiExp = it }, label = { Text("मुदत तारीख") }, modifier = Modifier.weight(1f))
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = computer, onCheckedChange = { computer = it })
                        Text("संगणक", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = ups, onCheckedChange = { ups = it })
                        Text("UPS/Inverter", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = solar, onCheckedChange = { solar = it })
                        Text("सोलर", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }

                OutlinedTextField(
                    value = notes, onValueChange = { notes = it },
                    label = { Text("अतिरिक्त नोंदी") }, modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) { Text("रद्द करा") }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val newCenter = SupplierEntity(
                                id = initialCenter?.id ?: UUID.randomUUID().toString(),
                                supplierId = code.ifBlank { "C-${(100..999).random()}" },
                                name = name,
                                supplierType = "Center",
                                mobile = mobile,
                                address = address,
                                routeId = selectedRouteId,
                                operatorName = operator,
                                cowQty = cowQty.toDoubleOrNull() ?: 0.0,
                                cowFat = cowFat.toDoubleOrNull() ?: 0.0,
                                cowSnf = cowSnf.toDoubleOrNull() ?: 0.0,
                                bufQty = bufQty.toDoubleOrNull() ?: 0.0,
                                bufFat = bufFat.toDoubleOrNull() ?: 0.0,
                                bufSnf = bufSnf.toDoubleOrNull() ?: 0.0,
                                iceBlocks = iceBlocks.toIntOrNull() ?: 0,
                                milkCansCount = cansCount.toIntOrNull() ?: 0,
                                fssaiNumber = fssaiNo,
                                fssaiExpiry = fssaiExp,
                                scaleBrand = scaleBrand,
                                fatMachineBrand = fatMachine,
                                computerAvailable = computer,
                                upsInverterAvailable = ups,
                                solarAvailable = solar,
                                additionalNotes = notes
                            )
                            onSave(newCenter)
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
fun CenterDetailDialog(
    center: SupplierEntity,
    routeName: String,
    onDismiss: () -> Unit
) {
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
                Text(text = center.name, fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                Text(text = "कोड: ${center.supplierId} | रूट: $routeName", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)

                HorizontalDivider()

                Text("चालक: ${center.operatorName.ifBlank { "-" }} | फोन: ${center.mobile.ifBlank { "-" }}", fontSize = 11.sp)
                Text("पत्ता: ${center.address.ifBlank { "-" }}", fontSize = 11.sp)

                Surface(color = MaterialTheme.colorScheme.surfaceVariant, shape = RoundedCornerShape(10.dp)) {
                    Column(modifier = Modifier.padding(10.dp).fillMaxWidth()) {
                        Text("दूध संकलन माहिती:", fontSize = 10.sp, fontWeight = FontWeight.Black)
                        Text("गाय: %.1f Liter (FAT: %.1f / SNF: %.1f)".format(center.cowQty, center.cowFat, center.cowSnf), fontSize = 11.sp)
                        Text("म्हैस: %.1f Liter (FAT: %.1f / SNF: %.1f)".format(center.bufQty, center.bufFat, center.bufSnf), fontSize = 11.sp)
                    }
                }

                Text("बर्फ लाद्या: ${center.iceBlocks} | कॅन संख्या: ${center.milkCansCount}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text("वजन काटा: ${center.scaleBrand.ifBlank { "-" }} | फॅट मशीन: ${center.fatMachineBrand.ifBlank { "-" }}", fontSize = 11.sp)
                Text("FSSAI: ${center.fssaiNumber.ifBlank { "-" }} (मुदत: ${center.fssaiExpiry.ifBlank { "-" }})", fontSize = 11.sp)

                Text(
                    text = "संगणक: ${if (center.computerAvailable) "होय" else "नाही"} | Inverter: ${if (center.upsInverterAvailable) "होय" else "नाही"} | सोलर: ${if (center.solarAvailable) "होय" else "नाही"}",
                    fontSize = 11.sp
                )

                if (center.additionalNotes.isNotBlank()) {
                    Text("नोंदी: ${center.additionalNotes}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                Button(onClick = onDismiss, modifier = Modifier.align(Alignment.End)) {
                    Text("बंद करा")
                }
            }
        }
    }
}
