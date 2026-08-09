package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.UserProfileEntity
import com.example.ui.AppViewModel

import com.example.ui.components.BreadcrumbNav

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: AppViewModel,
    onLogout: () -> Unit
) {
    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()

    var showEditDialog by remember { mutableStateOf(false) }
    var showPermissionPhotoModal by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Breadcrumb
        BreadcrumbNav(
            currentPageTitleMarathi = "प्रोफाईल व सेटिंग्ज",
            currentPageTitleEnglish = "Profile & Settings"
        )

        // User Profile Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(40.dp)
                    )
                }

                Text(
                    text = userProfile?.displayName ?: "प्रथमेष मोरे",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Text(
                    text = "कर्मचारी आयडी: ${userProfile?.employeeId ?: "EMP-949"}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                )
                Text(
                    text = userProfile?.email ?: "prathameshmore949@gmail.com",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                )

                Button(
                    onClick = { showEditDialog = true },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("माहिती अपडेट करा")
                }
            }
        }

        // Authorization Letter Section
        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Text("अधिकृत परवानगी पत्र (AUTHORIZATION)", fontSize = 13.sp, fontWeight = FontWeight.Black)
                    }
                }

                Text(
                    text = "डेअरी प्रशासन आणि शासनाकडून दूध संकलन व तपासणीसाठी दिलेले अधिकृत ओळखपत्र व अधिकार पत्र.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                OutlinedButton(
                    onClick = { showPermissionPhotoModal = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("परवानगी पत्र पहा (View Letter)")
                }
            }
        }

        // App Info & Logout
        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("ॲप माहिती", fontSize = 13.sp, fontWeight = FontWeight.Black)
                Text("संकलन नोंदवही (Procurement Notebook) v1.0", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("ऑटोमॅटिक डेटाबेस बॅकअप: सुरु (Local Room Database)", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

                HorizontalDivider()

                OutlinedButton(
                    onClick = onLogout,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.ExitToApp, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("लॉगआउट करा (LOGOUT)")
                }
            }
        }
    }

    if (showEditDialog) {
        EditProfileDialog(
            currentProfile = userProfile ?: UserProfileEntity(),
            onDismiss = { showEditDialog = false },
            onSave = { profile ->
                viewModel.saveProfile(profile)
                showEditDialog = false
            }
        )
    }

    if (showPermissionPhotoModal) {
        PermissionPhotoDialog(onDismiss = { showPermissionPhotoModal = false })
    }
}

@Composable
fun EditProfileDialog(
    currentProfile: UserProfileEntity,
    onDismiss: () -> Unit,
    onSave: (UserProfileEntity) -> Unit
) {
    var name by remember { mutableStateOf(currentProfile.displayName) }
    var empId by remember { mutableStateOf(currentProfile.employeeId) }
    var email by remember { mutableStateOf(currentProfile.email) }

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
                Text("प्रोफाइल संपादन", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)

                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("पूर्ण नाव") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = empId, onValueChange = { empId = it },
                    label = { Text("कर्मचारी आयडी") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = email, onValueChange = { email = it },
                    label = { Text("ईमेल") }, modifier = Modifier.fillMaxWidth(), singleLine = true
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) { Text("रद्द करा") }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(onClick = {
                        onSave(currentProfile.copy(displayName = name, employeeId = empId, email = email))
                    }) {
                        Text("जतन करा")
                    }
                }
            }
        }
    }
}

@Composable
fun PermissionPhotoDialog(onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("अधिकृत परवानगी पत्र", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("दूध संकलन व गुणवत्ता तपासणी परवानगी पत्र", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        Text("प्रथमेष मोरे (EMP-949)", fontSize = 11.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
                        Text("वैधता: २०२६-२०२८", fontSize = 10.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
                    }
                }

                Button(onClick = onDismiss, modifier = Modifier.fillMaxWidth()) {
                    Text("बंद करा")
                }
            }
        }
    }
}
