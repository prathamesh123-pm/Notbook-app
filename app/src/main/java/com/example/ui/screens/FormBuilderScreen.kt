package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.data.CustomFormEntity
import com.example.ui.AppViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

import com.example.ui.components.BreadcrumbNav

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FormBuilderScreen(viewModel: AppViewModel) {
    val forms by viewModel.forms.collectAsStateWithLifecycle()

    var showCreateDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Breadcrumb
        BreadcrumbNav(
            currentPageTitleMarathi = "फॉर्म बिल्डर / Word Editor",
            currentPageTitleEnglish = "Document & Form Builder"
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "फॉर्म बिल्डर (FORM BUILDER)",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "वर्ड रिपोर्ट, सानुकूल दस्तऐवज आणि अर्ज निर्मिती",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Button(onClick = { showCreateDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("नवीन फॉर्म", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        if (forms.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxWidth().weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text("एकही कस्टम फॉर्म तयार केलेला नाही", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(forms) { form ->
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp).fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(form.title, fontSize = 14.sp, fontWeight = FontWeight.Black)
                                Text("तयार तारीख: ${SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(Date(form.createdAt))}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            IconButton(onClick = { viewModel.deleteForm(form.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateCustomFormDialog(
            onDismiss = { showCreateDialog = false },
            onSave = { title ->
                val newForm = CustomFormEntity(
                    id = UUID.randomUUID().toString(),
                    title = title
                )
                viewModel.saveForm(newForm)
                showCreateDialog = false
            }
        )
    }
}

@Composable
fun CreateCustomFormDialog(
    onDismiss: () -> Unit,
    onSave: (String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var contentText by remember { mutableStateOf("") }
    var isBold by remember { mutableStateOf(false) }
    var isItalic by remember { mutableStateOf(false) }
    var isUnderline by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("नवीन वर्ड फॉर्म / दस्तऐवज (WORD EDITOR)", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)

                OutlinedTextField(
                    value = title, onValueChange = { title = it },
                    label = { Text("फॉर्मचे नाव / शीर्षक (Document Title) *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )

                // Formatting Toolbar
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        FilterChip(
                            selected = isBold,
                            onClick = { isBold = !isBold },
                            label = { Text("B", fontWeight = FontWeight.Black) }
                        )
                        FilterChip(
                            selected = isItalic,
                            onClick = { isItalic = !isItalic },
                            label = { Text("I", fontWeight = FontWeight.Bold) }
                        )
                        FilterChip(
                            selected = isUnderline,
                            onClick = { isUnderline = !isUnderline },
                            label = { Text("U", fontWeight = FontWeight.Bold) }
                        )
                        IconButton(onClick = { contentText += "\n• " }) {
                            Icon(Icons.Default.FormatListBulleted, contentDescription = "Bullet List", modifier = Modifier.size(18.dp))
                        }
                        IconButton(onClick = { contentText += "\n| अनुक्रमांक | तपशील | प्रमाण |" }) {
                            Icon(Icons.Default.TableChart, contentDescription = "Table", modifier = Modifier.size(18.dp))
                        }
                        IconButton(onClick = { contentText += " [फोटो समाविष्ट करा] " }) {
                            Icon(Icons.Default.Image, contentDescription = "Image", modifier = Modifier.size(18.dp))
                        }
                    }
                }

                // Editor Canvas
                OutlinedTextField(
                    value = contentText,
                    onValueChange = { contentText = it },
                    placeholder = { Text("येथे दस्तऐवज मजकूर किंवा तक्ता टाईप करा...", fontSize = 12.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    shape = RoundedCornerShape(12.dp)
                )

                // Export Options
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        AssistChip(
                            onClick = { },
                            label = { Text("DOCX Export", fontSize = 10.sp) },
                            leadingIcon = { Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(14.dp)) }
                        )
                        AssistChip(
                            onClick = { },
                            label = { Text("PDF Export", fontSize = 10.sp) },
                            leadingIcon = { Icon(Icons.Default.PictureAsPdf, contentDescription = null, modifier = Modifier.size(14.dp)) }
                        )
                    }

                    Row {
                        TextButton(onClick = onDismiss) { Text("रद्द करा") }
                        Spacer(modifier = Modifier.width(4.dp))
                        Button(
                            onClick = { onSave(title) },
                            enabled = title.isNotBlank()
                        ) {
                            Text("जतन करा")
                        }
                    }
                }
            }
        }
    }
}
