package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val RomanticColorScheme = lightColorScheme(
  primary = DeepRose,
  onPrimary = Color.White,
  secondary = RosePink,
  onSecondary = Color.White,
  tertiary = GoldAccent,
  onTertiary = Color.White,
  background = BabyPink,
  onBackground = RomanticWine,
  surface = Color.White,
  onSurface = RomanticWine
)

@Composable
fun MyApplicationTheme(
  content: @Composable () -> Unit
) {
  MaterialTheme(
    colorScheme = RomanticColorScheme,
    typography = Typography,
    content = content
  )
}
