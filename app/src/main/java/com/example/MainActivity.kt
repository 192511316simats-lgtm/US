package com.example

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.BabyPink
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
  private lateinit var filePickerLauncher: ActivityResultLauncher<String>

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Register activity result for photo picker / file chooser
    filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
      val callback = fileChooserCallback
      if (callback != null) {
        if (uris != null && uris.isNotEmpty()) {
          callback.onReceiveValue(uris.toTypedArray())
        } else {
          callback.onReceiveValue(null)
        }
        fileChooserCallback = null
      }
    }

    setContent {
      MyApplicationTheme {
        Scaffold(
          modifier = Modifier
            .fillMaxSize()
            .testTag("our_story_root_scaffold"),
          contentWindowInsets = WindowInsets.safeDrawing
        ) { innerPadding ->
          MemoryBookScreen(
            modifier = Modifier
              .fillMaxSize()
              .padding(innerPadding),
            onOpenFileChooser = { callback ->
              fileChooserCallback?.onReceiveValue(null)
              fileChooserCallback = callback
              filePickerLauncher.launch("image/*")
            }
          )
        }
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MemoryBookScreen(
  modifier: Modifier = Modifier,
  onOpenFileChooser: (ValueCallback<Array<Uri>>) -> Unit
) {
  var webViewInstance by remember { mutableStateOf<WebView?>(null) }

  BackHandler(enabled = webViewInstance != null) {
    webViewInstance?.evaluateJavascript(
      "(function() { if (typeof prevPage === 'function') { prevPage(); return true; } return false; })()"
    ) { result ->
      if (result != "true") {
        if (webViewInstance?.canGoBack() == true) {
          webViewInstance?.goBack()
        }
      }
    }
  }

  Box(
    modifier = modifier
      .background(BabyPink)
      .testTag("memory_book_container")
  ) {
    AndroidView(
      modifier = Modifier
        .fillMaxSize()
        .testTag("memory_book_webview"),
      factory = { ctx ->
        WebView(ctx).apply {
          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mediaPlaybackRequiresUserGesture = false
            useWideViewPort = true
            loadWithOverviewMode = true
            displayZoomControls = false
            builtInZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            loadsImagesAutomatically = true
          }

          setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

          webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
              webView: WebView?,
              filePathCallback: ValueCallback<Array<Uri>>?,
              fileChooserParams: FileChooserParams?
            ): Boolean {
              if (filePathCallback != null) {
                onOpenFileChooser(filePathCallback)
                return true
              }
              return false
            }

            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
              android.util.Log.d("MemoryBookWeb", "${consoleMessage?.message()} -- line ${consoleMessage?.lineNumber()}")
              return true
            }
          }

          webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
              super.onPageFinished(view, url)
              view?.visibility = android.view.View.VISIBLE
            }

            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
              if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                try {
                  val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                  ctx.startActivity(intent)
                  return true
                } catch (e: Exception) {
                  // Ignore
                }
              }
              return false
            }
          }

          loadUrl("file:///android_asset/index.html")
          webViewInstance = this
        }
      },
      update = { webView ->
        webViewInstance = webView
      }
    )
  }
}
