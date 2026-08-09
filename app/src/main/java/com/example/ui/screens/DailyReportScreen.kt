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

import androidx.compose.ui.platform.LocalContext
import android.widget.Toast
import com.example.ui.components.BreadcrumbNav

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyReportScreen(
    viewModel: AppViewModel,
    onReportSubmitted: () -> Unit
) {
    val context = LocalContext.current
    val routes by viewModel.routes.collectAsStateWithLifecycle()

    var activeTab by remember { mutableStateOf(0) } // 0: Route Visit, 1: Field Visit, 2: Office Work
    val tabs = listOf("रूट भेट (Route)", "क्षेत्र भेट (Field)", "कार्यालयीन काम (Office)")

    val currentDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

    // Form fields
    var heading by remember { mutableStateOf("") }
    var shift by remember { mutableStateOf("सकाळ") }
    var vehicleNo by remember { mutableStateOf("") }
    var driverName by remember { mutableStateOf("") }
    var selectedRouteName by remember { mutableStateOf(routes.firstOrNull()?.name ?: "") }
    var visitPerson by remember { mutableStateOf("") }
    var visitPurpose by remember { mutableStateOf("") }
    var visitDiscussion by remember { mutableStateOf("") }
    var officeTaskSubject by remember { mutableStateOf("") }
    var officeTaskDetails by remember { mutableStateOf("") }
    var achievements by remember { mutableStateOf("") }
    var problems by remember { mutableStateOf("") }
    var actionsTaken by remember { mutableStateOf("") }
    var supervisorName by remember { mutableStateOf("प्रथमेष मोरे") }

    var showSuccessSnackbar by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Breadcrumb
        BreadcrumbNav(
            currentPageTitleMarathi = "दैनिक अहवाल",
            currentPageTitleEnglish = "Daily Report Entry"
        )

        // Title & Export/Print Action Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "दैनंदिन कामकाज नोंद (DAILY REPORT)",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "तारीख: $currentDate",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(onClick = {
                    Toast.makeText(context, "PDF डाउनलोड सुरु झाले...", Toast.LENGTH_SHORT).show()
                }) {
                    Icon(Icons.Default.PictureAsPdf, contentDescription = "PDF Export", tint = Color(0xFFDC2626), modifier = Modifier.size(20.dp))
                }
                IconButton(onClick = {
                    Toast.makeText(context, "Excel फाईल तयार झाली!", Toast.LENGTH_SHORT).show()
                }) {
                    Icon(Icons.Default.TableChart, contentDescription = "Excel Export", tint = Color(0xFF16A34A), modifier = Modifier.size(20.dp))
                }
                IconButton(onClick = {
                    Toast.makeText(context, "प्रिंट कमांड पाठवली आहे", Toast.LENGTH_SHORT).show()
                }) {
                    Icon(Icons.Default.Print, contentDescription = "Print", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                }
            }
        }

        // Tabs
        TabRow(selectedTabIndex = activeTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = activeTab == index,
                    onClick = { activeTab = index },
                    text = {
                        Text(
                            text = title,
                            fontSize = 10.sp,
                            fontWeight = if (activeTab == index) FontWeight.Black else FontWeight.Bold
                        )
                    }
                )
            }
        }

        // Form Content
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = heading,
                onValueChange = { heading = it },
                label = { Text("अहवाल शीर्षक / विषय *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("report_heading_input"),
                singleLine = true
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("शिफ्ट:", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    Row {
                        FilterChip(
                            selected = shift == "सकाळ",
                            onClick = { shift = "सकाळ" },
                            label = { Text("सकाळ", fontSize = 10.sp) }
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        FilterChip(
                            selected = shift == "संध्याकाळ",
                            onClick = { shift = "संध्याकाळ" },
                            label = { Text("संध्याकाळ", fontSize = 10.sp) }
                        )
                    }
                }
            }

            when (activeTab) {
                0 -> { // Route Visit
                    Text("रूट भेट तपशील", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = vehicleNo, onValueChange = { vehicleNo = it },
                            label = { Text("वाहन क्रमांक") }, modifier = Modifier.weight(1f), singleLine = true
                        )
                        OutlinedTextField(
                            value = driverName, onValueChange = { driverName = it },
                            label = { Text("चालक नाव") }, modifier = Modifier.weight(1f), singleLine = true
                        )
                    }
                    OutlinedTextField(
                        value = selectedRouteName, onValueChange = { selectedRouteName = it },
                        label = { Text("रूट / मार्ग नाव") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                }
                1 -> { // Field Visit
                    Text("क्षेत्र भेट तपशील", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                    OutlinedTextField(
                        value = visitPerson, onValueChange = { visitPerson = it },
                        label = { Text("भेट दिलेल्या व्यक्तीचे / गवळी नाव") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = visitPurpose, onValueChange = { visitPurpose = it },
                        label = { Text("भेटीचा उद्देश") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = visitDiscussion, onValueChange = { visitDiscussion = it },
                        label = { Text("झालेली चर्चा व निर्णय") }, modifier = Modifier.fillMaxWidth()
                    )
                }
                2 -> { // Office Work
                    Text("कार्यालयीन काम", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                    OutlinedTextField(
                        value = officeTaskSubject, onValueChange = { officeTaskSubject = it },
                        label = { Text("कामकाज विषय") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                    )
                    OutlinedTextField(
                        value = officeTaskDetails, onValueChange = { officeTaskDetails = it },
                        label = { Text("कामकाजाचा तपशील") }, modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            HorizontalDivider()

            Text("अहवाल निष्कर्ष व नोंद", fontSize = 11.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)

            OutlinedTextField(
                value = achievements, onValueChange = { achievements = it },
                label = { Text("आजची यशस्विता / उपलब्धी (Achievements)") }, modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = problems, onValueChange = { problems = it },
                label = { Text("आढळलेल्या अडचणी / समस्या (Problems)") }, modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = actionsTaken, onValueChange = { actionsTaken = it },
                label = { Text("केलेली कारवाई (Actions Taken)") }, modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = supervisorName, onValueChange = { supervisorName = it },
                label = { Text("सुपरवायझर / अधिकारी नाव") }, modifier = Modifier.fillMaxWidth(), singleLine = true
            )

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = {
                    val typeName = when (activeTab) {
                        0 -> "Route Visit"
                        1 -> "Field Visit"
                        else -> "Daily Office Work"
                    }
                    val report = DailyReportEntity(
                        id = UUID.randomUUID().toString(),
                        type = typeName,
                        heading = heading.ifBlank { "$typeName - $currentDate" },
                        reportDate = currentDate,
                        summary = if (activeTab == 0) "रूट: $selectedRouteName, गाडी: $vehicleNo" else if (activeTab == 1) "भेट: $visitPerson, उद्देश: $visitPurpose" else officeTaskSubject,
                        shift = shift,
                        vehicleNo = vehicleNo,
                        driverName = driverName,
                        routeName = selectedRouteName,
                        visitPerson = visitPerson,
                        visitPurpose = visitPurpose,
                        visitDiscussion = visitDiscussion,
                        officeTaskSubject = officeTaskSubject,
                        officeTaskDetails = officeTaskDetails,
                        achievements = achievements,
                        problems = problems,
                        actionsTaken = actionsTaken,
                        supervisorName = supervisorName
                    )
                    viewModel.saveReport(report)
                    showSuccessSnackbar = true
                    onReportSubmitted()
                },
                enabled = heading.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("submit_daily_report_btn"),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("अहवाल सादर करा (SUBMIT REPORT)", fontWeight = FontWeight.Bold)
            }
        }
    }
}
