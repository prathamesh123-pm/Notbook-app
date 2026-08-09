package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.AppViewModel
import com.example.ui.components.BreadcrumbNav
import com.example.ui.components.RouteCollectionStatsWidget
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardScreen(
    viewModel: AppViewModel,
    onNavigate: (String) -> Unit
) {
    val suppliers by viewModel.suppliers.collectAsStateWithLifecycle()
    val routes by viewModel.routes.collectAsStateWithLifecycle()
    val tasks by viewModel.tasks.collectAsStateWithLifecycle()
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()

    val cowMilkTotal = suppliers.sumOf { it.cowQty }
    val bufMilkTotal = suppliers.sumOf { it.bufQty }
    val totalMilk = cowMilkTotal + bufMilkTotal
    val pendingTasksCount = tasks.count { it.status == "pending" }

    val currentDate = SimpleDateFormat("dd MMMM yyyy", Locale("mr", "IN")).format(Date())

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Breadcrumb
        item {
            BreadcrumbNav(
                currentPageTitleMarathi = "डॅशबोर्ड",
                currentPageTitleEnglish = "Overview"
            )
        }

        // Header
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "डॅशबोर्ड Overview",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = if (profile != null) "स्वागत आहे, ${profile?.displayName}" else "तुमच्या कार्याचा सारांश",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                    Surface(
                        color = MaterialTheme.colorScheme.surface,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                Icons.Default.CalendarToday,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = currentDate,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }

        // Key Metric Stat Cards
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "मुख्य आकडेवारी (METRICS)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    letterSpacing = 1.sp
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MetricCard(
                        title = "एकूण दूध",
                        value = "%.1f L".format(totalMilk),
                        subValue = "गाय: %.1fL | म्हैस: %.1fL".format(cowMilkTotal, bufMilkTotal),
                        icon = Icons.Default.WaterDrop,
                        iconBg = Color(0xFFE0F2FE),
                        iconTint = Color(0xFF0284C7),
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "सक्रिय रूट",
                        value = "${routes.size}",
                        subValue = "वाहन व लॉजिस्टिक",
                        icon = Icons.Default.LocalShipping,
                        iconBg = Color(0xFFD1FAE5),
                        iconTint = Color(0xFF059669),
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MetricCard(
                        title = "सप्लायर्स",
                        value = "${suppliers.size}",
                        subValue = "गवळी व सेंटर्स",
                        icon = Icons.Default.Warehouse,
                        iconBg = Color(0xFFF3E8FF),
                        iconTint = Color(0xFF7C3AED),
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "प्रलंबित कामे",
                        value = "$pendingTasksCount",
                        subValue = "तात्काळ लक्ष द्या",
                        icon = Icons.Default.CheckCircle,
                        iconBg = Color(0xFFFFE4E6),
                        iconTint = Color(0xFFE11D48),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Route Milk Collection Statistics Widget
        item {
            RouteCollectionStatsWidget(
                routes = routes,
                suppliers = suppliers,
                onNavigateToRoutes = { onNavigate("routes") }
            )
        }

        // Quick Actions
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "झटपट पर्याय (QUICK ACTIONS)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    letterSpacing = 1.sp
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    QuickActionCard(
                        title = "दैनिक अहवाल",
                        sub = "Report",
                        icon = Icons.Default.Assignment,
                        bgColor = Color(0xFF2563EB),
                        onClick = { onNavigate("daily_report") },
                        modifier = Modifier.weight(1f)
                    )
                    QuickActionCard(
                        title = "कामकाज नोंद",
                        sub = "Work Log",
                        icon = Icons.Default.Task,
                        bgColor = Color(0xFFEA580C),
                        onClick = { onNavigate("work_log") },
                        modifier = Modifier.weight(1f)
                    )
                    QuickActionCard(
                        title = "विशेष अहवाल",
                        sub = "Special Forms",
                        icon = Icons.Default.ReportProblem,
                        bgColor = Color(0xFFD97706),
                        onClick = { onNavigate("special_reports") },
                        modifier = Modifier.weight(1f)
                    )
                    QuickActionCard(
                        title = "रूट माहिती",
                        sub = "Routes",
                        icon = Icons.Default.Route,
                        bgColor = Color(0xFF059669),
                        onClick = { onNavigate("routes") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subValue: String,
    icon: ImageVector,
    iconBg: Color,
    iconTint: Color,
    modifier: Modifier = Modifier
) {
    ElevatedCard(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(20.dp))
            }
            Column {
                Text(
                    text = title.uppercase(),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = value,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = subValue,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    maxLines = 1
                )
            }
        }
    }
}

@Composable
fun QuickActionCard(
    title: String,
    sub: String,
    icon: ImageVector,
    bgColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .testTag("action_${sub.lowercase()}")
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(bgColor),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(22.dp))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = sub,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
