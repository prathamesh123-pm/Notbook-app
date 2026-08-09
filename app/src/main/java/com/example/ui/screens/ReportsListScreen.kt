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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.DailyReportEntity
import com.example.ui.AppViewModel

import com.example.ui.components.BreadcrumbNav

@Composable
fun ReportsListScreen(viewModel: AppViewModel) {
    val reports by viewModel.reports.collectAsStateWithLifecycle()

    var searchQuery by remember { mutableStateOf("") }
    var selectedReportForDetails by remember { mutableStateOf<DailyReportEntity?>(null) }

    val filteredReports = reports.filter { rep ->
        rep.heading.contains(searchQuery, ignoreCase = true) ||
                rep.type.contains(searchQuery, ignoreCase = true) ||
                rep.summary.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Breadcrumb
        BreadcrumbNav(
            currentPageTitleMarathi = "अहवाल पहा",
            currentPageTitleEnglish = "Reports Archive"
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "अहवाल दप्तर (REPORTS ARCHIVE)",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "सादर केलेले सर्व दैनिक व विशेष अहवाल",
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
                    text = "${reports.size} अहवाल",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("अहवाल शोधण्यासाठी टाईप करा...", fontSize = 12.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            shape = RoundedCornerShape(12.dp),
            singleLine = true
        )

        if (filteredReports.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text("एकही अहवाल सापडला नाही", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredReports) { report ->
                    ReportCardItem(
                        report = report,
                        onClick = { selectedReportForDetails = report },
                        onDelete = { viewModel.deleteReport(report.id) }
                    )
                }
            }
        }
    }

    selectedReportForDetails?.let { report ->
        ReportDetailDialog(report = report, onDismiss = { selectedReportForDetails = null })
    }
}

@Composable
fun ReportCardItem(
    report: DailyReportEntity,
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = report.heading,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "तारीख: ${report.reportDate} | प्रकार: ${report.type}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                }
            }

            if (report.summary.isNotBlank()) {
                Text(
                    text = report.summary,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2
                )
            }
        }
    }
}

@Composable
fun ReportDetailDialog(
    report: DailyReportEntity,
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
                Text(report.heading, fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                Text("प्रकार: ${report.type} | तारीख: ${report.reportDate}", fontSize = 11.sp, fontWeight = FontWeight.Bold)

                HorizontalDivider()

                if (report.shift.isNotBlank()) Text("शिफ्ट: ${report.shift}", fontSize = 11.sp)
                if (report.vehicleNo.isNotBlank()) Text("वाहन: ${report.vehicleNo} | ड्रायव्हर: ${report.driverName}", fontSize = 11.sp)
                if (report.routeName.isNotBlank()) Text("रूट: ${report.routeName}", fontSize = 11.sp)

                if (report.summary.isNotBlank()) Text("सारांश: ${report.summary}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                if (report.achievements.isNotBlank()) Text("उपलब्धी: ${report.achievements}", fontSize = 11.sp)
                if (report.problems.isNotBlank()) Text("समस्या: ${report.problems}", fontSize = 11.sp, color = MaterialTheme.colorScheme.error)
                if (report.actionsTaken.isNotBlank()) Text("कारवाई: ${report.actionsTaken}", fontSize = 11.sp)

                Text("अधिकारी / सुपरवायझर: ${report.supervisorName.ifBlank { "प्रथमेष मोरे" }}", fontSize = 11.sp, fontWeight = FontWeight.Black)

                Button(onClick = onDismiss, modifier = Modifier.align(Alignment.End)) {
                    Text("बंद करा")
                }
            }
        }
    }
}
