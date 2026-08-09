package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.RouteEntity
import com.example.data.SupplierEntity

data class RouteMilkStat(
    val route: RouteEntity,
    val totalLiters: Double,
    val cowLiters: Double,
    val bufLiters: Double,
    val avgFat: Double,
    val avgSnf: Double,
    val cowFatAvg: Double,
    val cowSnfAvg: Double,
    val bufFatAvg: Double,
    val bufSnfAvg: Double,
    val supplierCount: Int
)

data class OverallMilkStat(
    val totalLiters: Double,
    val cowLiters: Double,
    val bufLiters: Double,
    val avgFat: Double,
    val avgSnf: Double,
    val cowFatAvg: Double,
    val cowSnfAvg: Double,
    val bufFatAvg: Double,
    val bufSnfAvg: Double,
    val activeRoutesCount: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RouteCollectionStatsWidget(
    routes: List<RouteEntity>,
    suppliers: List<SupplierEntity>,
    onNavigateToRoutes: () -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(true) }
    var selectedFilter by remember { mutableStateOf("ALL") } // ALL, COW, BUFFALO

    // Compute stats per route
    val routeStats = remember(routes, suppliers) {
        routes.map { route ->
            val routeSuppliers = suppliers.filter { it.routeId == route.id }
            val cLiters = routeSuppliers.sumOf { it.cowQty }
            val bLiters = routeSuppliers.sumOf { it.bufQty }
            val tLiters = cLiters + bLiters

            val cFatSum = routeSuppliers.sumOf { it.cowQty * it.cowFat }
            val bFatSum = routeSuppliers.sumOf { it.bufQty * it.bufFat }
            val cSnfSum = routeSuppliers.sumOf { it.cowQty * it.cowSnf }
            val bSnfSum = routeSuppliers.sumOf { it.bufQty * it.bufSnf }

            val totalFatWeighted = if (tLiters > 0) (cFatSum + bFatSum) / tLiters else 0.0
            val totalSnfWeighted = if (tLiters > 0) (cSnfSum + bSnfSum) / tLiters else 0.0

            val cFatAvg = if (cLiters > 0) cFatSum / cLiters else 0.0
            val cSnfAvg = if (cLiters > 0) cSnfSum / cLiters else 0.0
            val bFatAvg = if (bLiters > 0) bFatSum / bLiters else 0.0
            val bSnfAvg = if (bLiters > 0) bSnfSum / bLiters else 0.0

            RouteMilkStat(
                route = route,
                totalLiters = tLiters,
                cowLiters = cLiters,
                bufLiters = bLiters,
                avgFat = totalFatWeighted,
                avgSnf = totalSnfWeighted,
                cowFatAvg = cFatAvg,
                cowSnfAvg = cSnfAvg,
                bufFatAvg = bFatAvg,
                bufSnfAvg = bSnfAvg,
                supplierCount = routeSuppliers.size
            )
        }
    }

    // Overall stats across all active routes
    val overallStat = remember(routeStats, suppliers) {
        val totalLiters = suppliers.sumOf { it.cowQty + it.bufQty }
        val cowLiters = suppliers.sumOf { it.cowQty }
        val bufLiters = suppliers.sumOf { it.bufQty }

        val cFatSum = suppliers.sumOf { it.cowQty * it.cowFat }
        val bFatSum = suppliers.sumOf { it.bufQty * it.bufFat }
        val cSnfSum = suppliers.sumOf { it.cowQty * it.cowSnf }
        val bSnfSum = suppliers.sumOf { it.bufQty * it.bufSnf }

        val avgFat = if (totalLiters > 0) (cFatSum + bFatSum) / totalLiters else 0.0
        val avgSnf = if (totalLiters > 0) (cSnfSum + bSnfSum) / totalLiters else 0.0

        val cowFatAvg = if (cowLiters > 0) cFatSum / cowLiters else 0.0
        val cowSnfAvg = if (cowLiters > 0) cSnfSum / cowLiters else 0.0
        val bufFatAvg = if (bufLiters > 0) bFatSum / bufLiters else 0.0
        val bufSnfAvg = if (bufLiters > 0) bSnfSum / bufLiters else 0.0

        OverallMilkStat(
            totalLiters = totalLiters,
            cowLiters = cowLiters,
            bufLiters = bufLiters,
            avgFat = avgFat,
            avgSnf = avgSnf,
            cowFatAvg = cowFatAvg,
            cowSnfAvg = cowSnfAvg,
            bufFatAvg = bufFatAvg,
            bufSnfAvg = bufSnfAvg,
            activeRoutesCount = routes.size
        )
    }

    ElevatedCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("route_milk_stats_widget"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
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
                            .size(38.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF0284C7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Analytics,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Column {
                        Text(
                            text = "रूटनिहाय दूध संकलन आकडेवारी",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "ROUTES COLLECTION SUMMARY",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                IconButton(
                    onClick = { expanded = !expanded },
                    modifier = Modifier
                        .size(36.dp)
                        .testTag("toggle_expand_route_stats")
                ) {
                    Icon(
                        imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                        contentDescription = "Toggle Expand",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            // Milk Filter Chips (All vs Cow vs Buffalo)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedFilter == "ALL",
                    onClick = { selectedFilter = "ALL" },
                    label = { Text("सर्व (All Milk)", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF0284C7),
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.testTag("filter_all_milk")
                )
                FilterChip(
                    selected = selectedFilter == "COW",
                    onClick = { selectedFilter = "COW" },
                    label = { Text("गाय (Cow)", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF16A34A),
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.testTag("filter_cow_milk")
                )
                FilterChip(
                    selected = selectedFilter == "BUFFALO",
                    onClick = { selectedFilter = "BUFFALO" },
                    label = { Text("म्हैस (Buffalo)", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF9333EA),
                        selectedLabelColor = Color.White
                    ),
                    modifier = Modifier.testTag("filter_buf_milk")
                )
            }

            // Overall Active Routes Summary Banner
            val currentTotalLiters = when (selectedFilter) {
                "COW" -> overallStat.cowLiters
                "BUFFALO" -> overallStat.bufLiters
                else -> overallStat.totalLiters
            }
            val currentAvgFat = when (selectedFilter) {
                "COW" -> overallStat.cowFatAvg
                "BUFFALO" -> overallStat.bufFatAvg
                else -> overallStat.avgFat
            }
            val currentAvgSnf = when (selectedFilter) {
                "COW" -> overallStat.cowSnfAvg
                "BUFFALO" -> overallStat.bufSnfAvg
                else -> overallStat.avgSnf
            }

            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFFF0F9FF)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Total Liters
                    StatBadgeItem(
                        label = "एकूण लिटर (Liters)",
                        value = "%.1f L".format(currentTotalLiters),
                        icon = Icons.Default.WaterDrop,
                        accentColor = Color(0xFF0284C7)
                    )

                    VerticalDivider(
                        modifier = Modifier.height(36.dp),
                        color = Color(0xFFBAE6FD)
                    )

                    // Average FAT
                    StatBadgeItem(
                        label = "सरासरी फॅट (FAT)",
                        value = "%.2f %%".format(currentAvgFat),
                        icon = Icons.Default.Opacity,
                        accentColor = Color(0xFFD97706)
                    )

                    VerticalDivider(
                        modifier = Modifier.height(36.dp),
                        color = Color(0xFFBAE6FD)
                    )

                    // Average SNF
                    StatBadgeItem(
                        label = "सरासरी एस.एन.एफ (SNF)",
                        value = "%.2f %%".format(currentAvgSnf),
                        icon = Icons.Default.Science,
                        accentColor = Color(0xFF16A34A)
                    )
                }
            }

            // Expandable Per-Route Breakdown
            AnimatedVisibility(visible = expanded) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "सक्रिय रूट तपशील (${routeStats.size} मार्ग)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        TextButton(
                            onClick = onNavigateToRoutes,
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 0.dp)
                        ) {
                            Text("सर्व रूट पहा →", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (routeStats.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "सध्या कोणताही सक्रिय रूट उपलब्ध नाही.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        routeStats.forEach { stat ->
                            val rLiters = when (selectedFilter) {
                                "COW" -> stat.cowLiters
                                "BUFFALO" -> stat.bufLiters
                                else -> stat.totalLiters
                            }
                            val rFat = when (selectedFilter) {
                                "COW" -> stat.cowFatAvg
                                "BUFFALO" -> stat.bufFatAvg
                                else -> stat.avgFat
                            }
                            val rSnf = when (selectedFilter) {
                                "COW" -> stat.cowSnfAvg
                                "BUFFALO" -> stat.bufSnfAvg
                                else -> stat.avgSnf
                            }

                            RouteItemCard(
                                routeStat = stat,
                                displayLiters = rLiters,
                                displayFat = rFat,
                                displaySnf = rSnf
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatBadgeItem(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    accentColor: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = accentColor,
                modifier = Modifier.size(13.dp)
            )
            Text(
                text = label,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            text = value,
            fontSize = 15.sp,
            fontWeight = FontWeight.Black,
            color = accentColor
        )
    }
}

@Composable
private fun RouteItemCard(
    routeStat: RouteMilkStat,
    displayLiters: Double,
    displayFat: Double,
    displaySnf: Double
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("route_card_${routeStat.route.id}"),
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Route Name & Vehicle info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalShipping,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    Column {
                        Text(
                            text = routeStat.route.name,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (routeStat.route.vehicle.isNotBlank()) {
                            Text(
                                text = routeStat.route.vehicle,
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Surface(
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "${routeStat.supplierCount} संकलन केंद्र/सप्लायर",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            HorizontalDivider(
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f)
            )

            // Metrics row: Liters, FAT, SNF
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Liters
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.WaterDrop,
                        contentDescription = null,
                        tint = Color(0xFF0284C7),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "दूध: ",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "%.1f L".format(displayLiters),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                // FAT
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "फॅट: ",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "%.2f %%".format(displayFat),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFD97706)
                    )
                }

                // SNF
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "एसएनएफ: ",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "%.2f %%".format(displaySnf),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF16A34A)
                    )
                }
            }
        }
    }
}
