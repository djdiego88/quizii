package co.app.quizii;

import android.os.Bundle;

import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

import com.whitestein.securestorage.SecureStoragePlugin;

import jp.rdlabo.capacitor.plugin.facebook.FacebookLogin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(FacebookLogin.class);
      add(GoogleAuth.class);
      add(SecureStoragePlugin.class);
    }});
  }
}
