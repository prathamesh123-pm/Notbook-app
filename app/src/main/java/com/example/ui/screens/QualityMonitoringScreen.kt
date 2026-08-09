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
import com.example.data.QualityMonitoringEntity
import com.example.ui.AppViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QualityMonitoringScreen(viewModel: AppViewModel) {
    val entries by viewModel.qualityEntries.collectAsStateWithLifecycle()

    var searchQuery by remember { mutableStateOf("") }
    var selectedReasonFilter by remember { mutableStateOf("सर्व") }
    var showAddDialog by remember { mutableStateOf(false) }
    var editingEntry by remember { mutableStateOf<QualityMonitoringEntity?>(null) }

    val reasonsList = listOf(
        "सर्व",
        "Repeated Adulteration",
        "Excessive Odor",
        "Late Milk Arrival",
        "Poor Milk Quality",
        "High Bacterial Contamination",
        "Irregular Milk Supply",
        "Other"
    )

    val filteredEntries = entries.filter { entry ->
        (selectedReasonFilter == "सर्व" || entry.reason == selectedReasonFilter) &&
                (entry.supplierName.contains(searchQuery, ignoreCase = true) ||
                        entry.villageName.contains(searchQuery, ignoreCase = true) ||
                        entry.chillingCenterName.contains(searchQuery, ignoreCase = true))
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = {
                    editingEntry = null
                    showAddDialog = true
                },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("नवीन नोंद", fontWeight = FontWeight.Bold) },
                containerColor = MaterialTheme.colorScheme.error,
                contentColor = Color.White,
                modifier = Modifier.testTag("add_quality_observation_fab")
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
            // Title
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "दूध गुणवत्ता नियंत्रण (QUALITY MONITORING)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.error
                    )
                    Text(
                        text = "अडचणीचे गवळी / सप्लायर व कारणे नोंद",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    color = MaterialTheme.colorScheme.errorContainer,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "${filteredEntries.size} नोंदी",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }

            // Search
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("गवळी नाव, गाव किंवा सेंटर शोधा...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Reason Filter Chips
            ScrollableTabRow(
                selectedTabIndex = reasonsList.indexOf(selectedReasonFilter).coerceAtLeast(0),
                edgePadding = 0.dp,
                divider = {}
            ) {
                reasonsList.forEach { reason ->
                    Tab(
                        selected = selectedReasonFilter == reason,
                        onClick = { selectedReasonFilter = reason },
                        text = {
                            Text(
                                text = when (reason) {
                                    "Repeated Adulteration" -> "भेसळ"
                                    "Excessive Odor" -> "दुर्गंधी"
                                    "Late Milk Arrival" -> "उशीरा आगमन"
                                    "Poor Milk Quality" -> "कमी प्रत"
                                    "High Bacterial Contamination" -> "बॅक्टेरिया"
                                    "Irregular Milk Supply" -> "अनियमित"
                                    else -> reason
                                },
                                fontSize = 11.sp,
                                fontWeight = if (selectedReasonFilter == reason) FontWeight.Black else FontWeight.Medium
                            )
                        }
                    )
                }
            }

            // Entries List
            if (filteredEntries.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text("एकही गुणवत्ता नोंद सापडली नाही", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredEntries) { item ->
                        QualityObservationCard(
                            item = item,
                            onToggleStatus = {
                                val newStatus = if (item.status == "Active") "Resolved" else "Active"
                                viewModel.updateQualityEntry(item.copy(status = newStatus))
                            },
                            onDelete = { viewModel.deleteQualityEntry(item.id) }
                        )
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddEditQualityDialog(
            initialEntry = editingEntry,
            onDismiss = { showAddDialog = false },
            onSave = { entry ->
                viewModel.saveQualityEntry(entry)
                showAddDialog = false
            }
        )
    }
}

@Composable
fun QualityObservationCard(
    item: QualityMonitoringEntity,
    onToggleStatus: () -> Unit,
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
                        text = item.supplierName,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "प्रकार: ${item.supplierType} | गाव: ${item.villageName}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    color = if (item.status == "Active") MaterialTheme.colorScheme.errorContainer else Color(0xFFD1FAE5),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = if (item.status == "Active") "सक्रिय तक्रार" else "निवारण झाले",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        color = if (item.status == "Active") MaterialTheme.colorScheme.error else Color(0xFF059669),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(10.dp)
            ) {
                Column(modifier = Modifier.padding(10.dp).fillMaxWidth()) {
                    Text(
                        text = "कारण: ${item.reason}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.error
                    )
                    if (item.detailedRemarks.isNotBlank()) {
                        Text(
                            text = item.detailedRemarks,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Text(
                        text = "तारीख: ${item.observationDate} | केंद्र: ${item.chillingCenterName.ifBlank { "-" }}",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onToggleStatus) {
                    Text(
                        text = if (item.status == "Active") "मार्किंग: Resolved करा" else "पुन्हा Active करा",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
fun AddEditQualityDialog(
    initialEntry: QualityMonitoringEntity?,
    onDismiss: () -> Unit,
    onSave: (QualityMonitoringEntity) -> Unit
) {
    var supplierName by remember { mutableStateOf(initialEntry?.supplierName ?: "") }
    var supplierType by remember { mutableStateOf(initialEntry?.supplierType ?: "Gavali") }
    var villageName by remember { mutableStateOf(initialEntry?.villageName ?: "") }
    var centerName by remember { mutableStateOf(initialEntry?.chillingCenterName ?: "") }
    var reason by remember { mutableStateOf(initialEntry?.reason ?: "Repeated Adulteration") }
    var remarks by remember { mutableStateOf(initialEntry?.detailedRemarks ?: "") }

    val currentDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

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
                    text = "गुणवत्ता अडचण नोंदवा",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.error
                )

                OutlinedTextField(
                    value = supplierName, onValueChange = { supplierName = it },
                    label = { Text("सप्लायर / गवळी नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = villageName, onValueChange = { villageName = it },
                        label = { Text("गाव नाव") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                    OutlinedTextField(
                        value = centerName, onValueChange = { centerName = it },
                        label = { Text("चिलिंग सेंटर") }, modifier = Modifier.weight(1f), singleLine = true
                    )
                }

                Text("कारण निवडा:", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                val reasons = listOf("Repeated Adulteration", "Excessive Odor", "Late Milk Arrival", "Poor Milk Quality", "High Bacterial Contamination", "Irregular Milk Supply", "Other")
                reasons.forEach { r ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = reason == r, onClick = { reason = r })
                        Text(r, fontSize = 11.sp)
                    }
                }

                OutlinedTextField(
                    value = remarks, onValueChange = { remarks = it },
                    label = { Text("सविस्तर रिमार्क / निरीक्षण") }, modifier = Modifier.fillMaxWidth()
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
                            val newEntry = QualityMonitoringEntity(
                                id = initialEntry?.id ?: UUID.randomUUID().toString(),
                                supplierType = supplierType,
                                supplierName = supplierName,
                                villageName = villageName,
                                chillingCenterName = centerName,
                                observationDate = currentDate,
                                reason = reason,
                                detailedRemarks = remarks,
                                status = "Active"
                            )
                            onSave(newEntry)
                        },
                        enabled = supplierName.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("जतन करा")
                    }
                }
            }
        }
    }
}
