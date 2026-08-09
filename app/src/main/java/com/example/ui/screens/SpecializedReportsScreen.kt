package com.example.ui.screens

import androidx.compose.foundation.layout.*
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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.DailyReportEntity
import com.example.ui.AppViewModel
import java.text.SimpleDateFormat
import java.util.*

import com.example.ui.components.BreadcrumbNav

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpecializedReportsScreen(
    viewModel: AppViewModel,
    onNavigateToArchive: () -> Unit
) {
    val centers by viewModel.centers.collectAsStateWithLifecycle()

    var selectedReportType by remember { mutableStateOf(0) } // 0: Audit, 1: Breakdown, 2: Seizure & Fine
    val reportTypes = listOf("केंद्र ऑडिट", "वाहन बिघाड", "जप्ती व दंड")

    val currentDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

    // Audit State
    var centerCode by remember { mutableStateOf("") }
    var centerName by remember { mutableStateOf("") }
    var auditDate by remember { mutableStateOf(currentDate) }
    var mornQty by remember { mutableStateOf("") }
    var eveQty by remember { mutableStateOf("") }
    var fat by remember { mutableStateOf("") }
    var snf by remember { mutableStateOf("") }
    var auditResult by remember { mutableStateOf("GOOD") }

    // Breakdown State
    var routeName by remember { mutableStateOf("") }
    var vehicleNo by remember { mutableStateOf("") }
    var driverName by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var lossAmount by remember { mutableStateOf("") }

    // Seizure State
    var seizureLocation by remember { mutableStateOf("") }
    var seizedItemQty by remember { mutableStateOf("") }
    var seizureReason by remember { mutableStateOf("") }
    var fineAmount by remember { mutableStateOf("") }
    var actionTaken by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Breadcrumb
        BreadcrumbNav(
            currentPageTitleMarathi = "ERP रिपोर्ट",
            currentPageTitleEnglish = "ERP Reports & Analytics"
        )

        // Title
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "ERP विशेष रिपोर्ट (ERP REPORTS)",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.tertiary
                )
                Text(
                    text = "ऑडिट, ब्रेकडाऊन आणि दंडात्मक नोंदी",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Tabs
        TabRow(selectedTabIndex = selectedReportType) {
            reportTypes.forEachIndexed { index, title ->
                Tab(
                    selected = selectedReportType == index,
                    onClick = { selectedReportType = index },
                    text = {
                        Text(
                            text = title,
                            fontSize = 11.sp,
                            fontWeight = if (selectedReportType == index) FontWeight.Black else FontWeight.Bold
                        )
                    }
                )
            }
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            when (selectedReportType) {
                0 -> { // Center Audit
                    Text("संकलन केंद्र ऑडिट फॉर्म", fontSize = 12.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)

                    OutlinedTextField(
                        value = centerName, onValueChange = { centerName = it },
                        label = { Text("केंद्राचे नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = centerCode, onValueChange = { centerCode = it },
                        label = { Text("केंद्र कोड") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = mornQty, onValueChange = { mornQty = it }, label = { Text("सकाळ दूध L") }, modifier = Modifier.weight(1f))
                        OutlinedTextField(value = eveQty, onValueChange = { eveQty = it }, label = { Text("संध्याकाळ दूध L") }, modifier = Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = fat, onValueChange = { fat = it }, label = { Text("तपासलेली FAT %") }, modifier = Modifier.weight(1f))
                        OutlinedTextField(value = snf, onValueChange = { snf = it }, label = { Text("तपासलेली SNF %") }, modifier = Modifier.weight(1f))
                    }

                    Text("ऑडिट निकाल (Result):", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("GOOD" to "उत्कृष्ट (GOOD)", "NEEDS_IMPROVEMENT" to "सुधारणा हवी", "CRITICAL" to "गंभीर (CRITICAL)").forEach { (resVal, label) ->
                            FilterChip(
                                selected = auditResult == resVal,
                                onClick = { auditResult = resVal },
                                label = { Text(label, fontSize = 9.sp) }
                            )
                        }
                    }
                }
                1 -> { // Breakdown
                    Text("दूध वाहतूक वाहन बिघाड अहवाल", fontSize = 12.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.error)

                    OutlinedTextField(
                        value = routeName, onValueChange = { routeName = it },
                        label = { Text("रूटचे नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = vehicleNo, onValueChange = { vehicleNo = it }, label = { Text("गाडी नंबर") }, modifier = Modifier.weight(1f))
                        OutlinedTextField(value = driverName, onValueChange = { driverName = it }, label = { Text("ड्रायव्हर नाव") }, modifier = Modifier.weight(1f))
                    }
                    OutlinedTextField(
                        value = location, onValueChange = { location = it },
                        label = { Text("बिघाड ठिकाण व वेळ") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = reason, onValueChange = { reason = it },
                        label = { Text("बिघाडाचे कारण") }, modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = lossAmount, onValueChange = { lossAmount = it },
                        label = { Text("अंदाजे नुकसान रक्कम (₹)") }, modifier = Modifier.fillMaxWidth()
                    )
                }
                2 -> { // Seizure & Fine
                    Text("दूध जप्ती व दंडात्मक अहवाल", fontSize = 12.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.tertiary)

                    OutlinedTextField(
                        value = seizureLocation, onValueChange = { seizureLocation = it },
                        label = { Text("जप्ती ठिकाण / केंद्र नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = seizedItemQty, onValueChange = { seizedItemQty = it },
                        label = { Text("जप्त केलेले दूध / साहित्य प्रमाण") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = seizureReason, onValueChange = { seizureReason = it },
                        label = { Text("जप्ती व दंडाचे कारण (भेसळ / गैरप्रकार)") }, modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = fineAmount, onValueChange = { fineAmount = it },
                        label = { Text("ठोठावलेला दंड (₹)") }, modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = actionTaken, onValueChange = { actionTaken = it },
                        label = { Text("केलेली कायदेशीर / शिस्तभंग कारवाई") }, modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = {
                    val report = when (selectedReportType) {
                        0 -> DailyReportEntity(
                            id = UUID.randomUUID().toString(),
                            type = "Collection Center Audit",
                            heading = "केंद्र ऑडिट - $centerName",
                            reportDate = auditDate,
                            summary = "निकाल: $auditResult | Fat: $fat | SNF: $snf",
                            supervisorName = "प्रथमेष मोरे"
                        )
                        1 -> DailyReportEntity(
                            id = UUID.randomUUID().toString(),
                            type = "Transport Breakdown Report",
                            heading = "वाहन बिघाड - $routeName ($vehicleNo)",
                            reportDate = currentDate,
                            summary = "ठिकाण: $location | कारण: $reason",
                            totalLossAmount = lossAmount.toDoubleOrNull() ?: 0.0,
                            supervisorName = "प्रथमेष मोरे"
                        )
                        else -> DailyReportEntity(
                            id = UUID.randomUUID().toString(),
                            type = "Seizure & Fine Report",
                            heading = "दूध जप्ती व दंड - $seizureLocation",
                            reportDate = currentDate,
                            summary = "जप्त प्रमाण: $seizedItemQty | दंड: ₹$fineAmount",
                            supervisorName = "प्रथमेष मोरे"
                        )
                    }
                    viewModel.saveReport(report)
                    onNavigateToArchive()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("submit_special_report_btn"),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("अहवाल सेव्ह करा", fontWeight = FontWeight.Bold)
            }
        }
    }
}
