package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.ui.AppViewModel
import com.example.ui.components.BreadcrumbNav
import java.util.UUID

data class ChillingCenterItem(
    val id: String,
    val code: String,
    val name: String,
    val location: String,
    val capacityLiters: Double,
    val currentCollectionLiters: Double,
    val inchargeName: String,
    val contactPhone: String,
    val status: String = "सक्रिय", // सक्रिय (Active), निगा आवश्यकता (Maintenance)
    val tankerNumber: String = "MH 16 AB 9081",
    val tankerDriver: String = "अशोक जगताप",
    val tankerTempCelsius: Double = 4.2,
    val mapQuery: String = ""
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChillingCenterScreen(viewModel: AppViewModel) {
    val context = LocalContext.current

    // Sample/In-memory initial state for Chilling Centers (can be edited/added)
    var chillingList by remember {
        mutableStateOf(
            listOf(
                ChillingCenterItem(
                    id = "cc-1",
                    code = "CC-101",
                    name = "रस्तापूर मुख्य चिलिंग प्लांट",
                    location = "रस्तापूर फाटा, नेवासा",
                    capacityLiters = 10000.0,
                    currentCollectionLiters = 7450.0,
                    inchargeName = "विठ्ठलराव देशमुख",
                    contactPhone = "9822334455",
                    status = "सक्रिय",
                    tankerNumber = "MH 16 AB 1002",
                    tankerDriver = "सुरेश जाधव",
                    tankerTempCelsius = 3.8,
                    mapQuery = "Rastapur, Maharashtra"
                ),
                ChillingCenterItem(
                    id = "cc-2",
                    code = "CC-102",
                    name = "शिर्डी रोड चिलिंग युनिट",
                    location = "वाकडी, ता. राहता",
                    capacityLiters = 5000.0,
                    currentCollectionLiters = 3800.0,
                    inchargeName = "गणेश शिंदे",
                    contactPhone = "9890112233",
                    status = "सक्रिय",
                    tankerNumber = "MH 17 BD 4099",
                    tankerDriver = "प्रकाश पाटील",
                    tankerTempCelsius = 4.1,
                    mapQuery = "Vakadi, Rahata"
                )
            )
        )
    }

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilterStatus by remember { mutableStateOf("सर्व") }
    var showAddDialog by remember { mutableStateOf(false) }
    var editingItem by remember { mutableStateOf<ChillingCenterItem?>(null) }

    val filteredList = chillingList.filter { cc ->
        (searchQuery.isBlank() || cc.name.contains(searchQuery, ignoreCase = true) ||
                cc.code.contains(searchQuery, ignoreCase = true) ||
                cc.location.contains(searchQuery, ignoreCase = true)) &&
                (selectedFilterStatus == "सर्व" || cc.status == selectedFilterStatus)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Breadcrumb
        BreadcrumbNav(
            currentPageTitleMarathi = "चिलिंग सेंटर",
            currentPageTitleEnglish = "Chilling Units"
        )

        // Title Header & Add Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "चिलिंग सेंटर व्यवस्थापन (CHILLING UNITS)",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0284C7)
                )
                Text(
                    text = "दूध शीतकरण व टँकर संचलन माहिती",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Button(
                onClick = { showAddDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.testTag("add_chilling_center_btn")
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("नवीन चिलिंग युनिट", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        // Search and Filter Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("चिलिंग सेंटर किंवा ठिकाण शोधा...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(18.dp)) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", modifier = Modifier.size(16.dp))
                        }
                    }
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Status Filter Chips
            FilterChip(
                selected = selectedFilterStatus == "सर्व",
                onClick = { selectedFilterStatus = "सर्व" },
                label = { Text("सर्व", fontSize = 11.sp) }
            )
            FilterChip(
                selected = selectedFilterStatus == "सक्रिय",
                onClick = { selectedFilterStatus = "सक्रिय" },
                label = { Text("सक्रिय", fontSize = 11.sp) }
            )
        }

        // List View
        if (filteredList.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.AcUnit, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("एकही चिलिंग सेंटर सापडले नाही", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList) { item ->
                    ChillingCenterCard(
                        item = item,
                        onEdit = { editingItem = item },
                        onDelete = { chillingList = chillingList.filter { it.id != item.id } },
                        onOpenMap = {
                            val mapUri = Uri.parse("geo:0,0?q=${Uri.encode(item.location + " Maharashtra")}")
                            val mapIntent = Intent(Intent.ACTION_VIEW, mapUri)
                            context.startActivity(Intent.createChooser(mapIntent, "गूगल मॅप उघडा"))
                        }
                    )
                }
            }
        }
    }

    if (showAddDialog) {
        AddEditChillingCenterDialog(
            item = null,
            onDismiss = { showAddDialog = false },
            onSave = { newItem ->
                chillingList = chillingList + newItem
                showAddDialog = false
            }
        )
    }

    editingItem?.let { item ->
        AddEditChillingCenterDialog(
            item = item,
            onDismiss = { editingItem = null },
            onSave = { updated ->
                chillingList = chillingList.map { if (it.id == updated.id) updated else it }
                editingItem = null
            }
        )
    }
}

@Composable
fun ChillingCenterCard(
    item: ChillingCenterItem,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onOpenMap: () -> Unit
) {
    val usagePercentage = if (item.capacityLiters > 0) (item.currentCollectionLiters / item.capacityLiters).coerceIn(0.0, 1.0) else 0.0

    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFE0F2FE)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AcUnit, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(20.dp))
                    }
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(item.name, fontSize = 14.sp, fontWeight = FontWeight.Black)
                            Surface(color = Color(0xFFE0F2FE), shape = RoundedCornerShape(6.dp)) {
                                Text(item.code, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0284C7), modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                            }
                        }
                        Text(item.location, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Row {
                    IconButton(onClick = onEdit, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp))
                    }
                }
            }

            // Capacity Progress Bar
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("क्षमता वापर: %.0f L / %.0f L".format(item.currentCollectionLiters, item.capacityLiters), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("%.1f %%".format(usagePercentage * 100), fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color(0xFF0284C7))
                }
                LinearProgressIndicator(
                    progress = usagePercentage.toFloat(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = Color(0xFF0284C7),
                    trackColor = Color(0xFFE0F2FE)
                )
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

            // Tanker and Contact Details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("टँकर नंबर: ${item.tankerNumber}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("चालक: ${item.tankerDriver} (${item.tankerTempCelsius} °C)", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("इंचार्ज: ${item.inchargeName}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("संपर्क: ${item.contactPhone}", fontSize = 10.sp, color = Color(0xFF16A34A), fontWeight = FontWeight.Bold)
                }
            }

            // Google Maps Link Button
            OutlinedButton(
                onClick = onOpenMap,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(vertical = 6.dp)
            ) {
                Icon(Icons.Default.Map, contentDescription = null, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("गूगल मॅपवर लोकेशन पहा (Google Maps)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun AddEditChillingCenterDialog(
    item: ChillingCenterItem?,
    onDismiss: () -> Unit,
    onSave: (ChillingCenterItem) -> Unit
) {
    var code by remember { mutableStateOf(item?.code ?: "CC-${(100..999).random()}") }
    var name by remember { mutableStateOf(item?.name ?: "") }
    var location by remember { mutableStateOf(item?.location ?: "") }
    var capacity by remember { mutableStateOf(item?.capacityLiters?.toString() ?: "5000") }
    var currentColl by remember { mutableStateOf(item?.currentCollectionLiters?.toString() ?: "0") }
    var incharge by remember { mutableStateOf(item?.inchargeName ?: "") }
    var phone by remember { mutableStateOf(item?.contactPhone ?: "") }
    var tankerNo by remember { mutableStateOf(item?.tankerNumber ?: "") }
    var driver by remember { mutableStateOf(item?.tankerDriver ?: "") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = if (item == null) "नवीन चिलिंग सेंटर जोडा" else "चिलिंग सेंटर माहिती संपादन",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0284C7)
                )

                OutlinedTextField(value = code, onValueChange = { code = it }, label = { Text("सेंटर कोड") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("सेंटरचे नाव *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = location, onValueChange = { location = it }, label = { Text("ठिकाण / पत्ता *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = capacity, onValueChange = { capacity = it }, label = { Text("क्षमता (L)") }, modifier = Modifier.weight(1f), singleLine = true)
                    OutlinedTextField(value = currentColl, onValueChange = { currentColl = it }, label = { Text("सध्याचे दूध (L)") }, modifier = Modifier.weight(1f), singleLine = true)
                }
                OutlinedTextField(value = incharge, onValueChange = { incharge = it }, label = { Text("इंचार्ज अधिकारी") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("संपर्क मोबाईल") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = tankerNo, onValueChange = { tankerNo = it }, label = { Text("टँकर क्रमांक") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = driver, onValueChange = { driver = it }, label = { Text("टँकर चालक नाव") }, modifier = Modifier.fillMaxWidth(), singleLine = true)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) { Text("रद्द करा") }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val newItem = ChillingCenterItem(
                                id = item?.id ?: UUID.randomUUID().toString(),
                                code = code,
                                name = name,
                                location = location,
                                capacityLiters = capacity.toDoubleOrNull() ?: 5000.0,
                                currentCollectionLiters = currentColl.toDoubleOrNull() ?: 0.0,
                                inchargeName = incharge,
                                contactPhone = phone,
                                tankerNumber = tankerNo,
                                tankerDriver = driver
                            )
                            onSave(newItem)
                        },
                        enabled = name.isNotBlank() && location.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7))
                    ) {
                        Text("जतन करा")
                    }
                }
            }
        }
    }
}
