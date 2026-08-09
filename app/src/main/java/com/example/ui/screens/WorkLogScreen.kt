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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.WorkTaskEntity
import com.example.ui.AppViewModel
import java.util.UUID

import com.example.ui.components.BreadcrumbNav

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkLogScreen(viewModel: AppViewModel) {
    val tasks by viewModel.tasks.collectAsStateWithLifecycle()

    var activeTab by remember { mutableStateOf(0) } // 0: All, 1: Pending, 2: Completed
    val tabs = listOf("सर्व कामे", "प्रलंबित (Pending)", "पूर्ण (Done)")

    var searchQuery by remember { mutableStateOf("") }
    var showAddTaskDialog by remember { mutableStateOf(false) }

    val filteredTasks = tasks.filter { task ->
        (searchQuery.isBlank() || task.title.contains(searchQuery, ignoreCase = true) || task.description.contains(searchQuery, ignoreCase = true)) &&
        when (activeTab) {
            1 -> task.status == "pending"
            2 -> task.status == "completed"
            else -> true
        }
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddTaskDialog = true },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("नवीन कार्य", fontWeight = FontWeight.Bold) },
                containerColor = Color(0xFFEA580C),
                contentColor = Color.White,
                modifier = Modifier.testTag("add_work_task_fab")
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
                currentPageTitleMarathi = "कामकाज नोंद",
                currentPageTitleEnglish = "Tasks & Work Log"
            )

            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "दैनिक कामे नोंदवही (WORK LOG)",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFEA580C)
                    )
                    Text(
                        text = "दैनंदिन कर्तव्ये आणि तातडीची कामे",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Surface(
                    color = Color(0xFFFFEDD5),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "${filteredTasks.size} कामे",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFC2410C),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("कामकाज शोधा...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Tabs
            TabRow(selectedTabIndex = activeTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = activeTab == index,
                        onClick = { activeTab = index },
                        text = {
                            Text(
                                text = title,
                                fontSize = 11.sp,
                                fontWeight = if (activeTab == index) FontWeight.Black else FontWeight.Bold
                            )
                        }
                    )
                }
            }

            // Tasks List
            if (filteredTasks.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text("एकही कार्य सापडले नाही", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredTasks) { task ->
                        TaskCardItem(
                            task = task,
                            onToggle = { viewModel.toggleTaskStatus(task.id, task.status) },
                            onDelete = { viewModel.deleteTask(task.id) }
                        )
                    }
                }
            }
        }
    }

    if (showAddTaskDialog) {
        AddTaskDialog(
            onDismiss = { showAddTaskDialog = false },
            onSave = { title, desc ->
                val task = WorkTaskEntity(
                    id = UUID.randomUUID().toString(),
                    title = title,
                    description = desc,
                    status = "pending"
                )
                viewModel.saveTask(task)
                showAddTaskDialog = false
            }
        )
    }
}

@Composable
fun TaskCardItem(
    task: WorkTaskEntity,
    onToggle: () -> Unit,
    onDelete: () -> Unit
) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Checkbox(
                checked = task.status == "completed",
                onCheckedChange = { onToggle() },
                modifier = Modifier.testTag("task_checkbox_${task.id}")
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = task.title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    color = if (task.status == "completed") MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                    textDecoration = if (task.status == "completed") TextDecoration.LineThrough else TextDecoration.None
                )
                if (task.description.isNotBlank()) {
                    Text(
                        text = task.description,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2
                    )
                }
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
fun AddTaskDialog(
    onDismiss: () -> Unit,
    onSave: (String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }

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
                Text("नवीन कार्य जोडा", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color(0xFFEA580C))

                OutlinedTextField(
                    value = title, onValueChange = { title = it },
                    label = { Text("कार्याचा विषय / शीर्षक *") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = desc, onValueChange = { desc = it },
                    label = { Text("सविस्तर स्पष्टीकरण") }, modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) { Text("रद्द करा") }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = { onSave(title, desc) },
                        enabled = title.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEA580C))
                    ) {
                        Text("जतन करा")
                    }
                }
            }
        }
    }
}
