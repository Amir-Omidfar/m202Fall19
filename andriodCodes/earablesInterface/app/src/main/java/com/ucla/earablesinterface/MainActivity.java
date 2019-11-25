package com.ucla.earablesinterface;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GestureDetectorCompat;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import org.altbeacon.beacon.Region;
import org.altbeacon.beacon.powersave.BackgroundPowerSaver;
import org.altbeacon.beacon.startup.BootstrapNotifier;
import org.altbeacon.beacon.startup.RegionBootstrap;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

import org.altbeacon.beacon.BeaconManager;
import org.altbeacon.beacon.BeaconParser;



public class MainActivity extends AppCompatActivity  {



    TextToSpeech t1;
    EditText ed1;
    Button b1;
    HashMap<String, String> map;
    private final String UTTERANCE_ID = "Utterance_Id";
    private final int BEACON_SENSE = 12;

    private final int ACT_CHECK_TTS_DATA = 1000;
    private RegionBootstrap regionBootstrap;
    private BackgroundPowerSaver backgroundPowerSaver;
    private static final int PERMISSION_REQUEST_FINE_LOCATION = 1;
    private static final int PERMISSION_REQUEST_BACKGROUND_LOCATION = 2;
    boolean starting = true;
    private final int REQ_CODE_SPEECH_INPUT = 100;
    private final String DESTINATION_STRING = "Please specify a destination";
    JSONObject json_dest;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ed1 = (EditText)findViewById(R.id.editText);
        b1 = (Button)findViewById(R.id.button);

        map = new HashMap<String, String>();
        map.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, UTTERANCE_ID);


        b1.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v){
                String toSpeak = ed1.getText().toString();
                t1.speak(toSpeak, TextToSpeech.QUEUE_FLUSH, null);
            }
        });


        BeaconManager beaconManager = org.altbeacon.beacon.BeaconManager.getInstanceForApplication(this);
        beaconManager.getBeaconParsers().clear();
        beaconManager.getBeaconParsers().add(new BeaconParser().
                setBeaconLayout("m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24"));
        backgroundPowerSaver = new BackgroundPowerSaver(this);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (this.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                    == PackageManager.PERMISSION_GRANTED) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    if (this.checkSelfPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                            != PackageManager.PERMISSION_GRANTED) {

                        requestPermissions(new String[]{Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                                            PERMISSION_REQUEST_BACKGROUND_LOCATION);
                    }

                }

            } else {
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                                    Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                            PERMISSION_REQUEST_FINE_LOCATION);


            }
        }


        // Check to see if we have TTS voice data
        Intent ttsIntent = new Intent();
        ttsIntent.setAction(TextToSpeech.Engine.ACTION_CHECK_TTS_DATA);
        startActivityForResult(ttsIntent, ACT_CHECK_TTS_DATA);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode,
                                    Intent data) {
        if (requestCode == ACT_CHECK_TTS_DATA) {
            if (resultCode == TextToSpeech.Engine.CHECK_VOICE_DATA_PASS) {
                // Data exists, so we instantiate the TTS engine
                t1 = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
                    @Override
                    public void onInit(int status) {
                        if(status == TextToSpeech.SUCCESS){
                            if(t1 != null) {
                                int result = t1.setLanguage(Locale.UK);
                                if (result == TextToSpeech.LANG_MISSING_DATA ||
                                        result == TextToSpeech.LANG_NOT_SUPPORTED) {
                                    Toast.makeText(getApplicationContext(), "TTS language is not supported", Toast.LENGTH_LONG).show();
                                } else {
                                    //t1.speak("TTS is ready", TextToSpeech.QUEUE_FLUSH, null);
                                }

                                t1.setSpeechRate(1);
                                t1.setPitch(1);
                                t1.setOnUtteranceProgressListener(new SpeechUtteranceListener());
                                t1.speak(DESTINATION_STRING, TextToSpeech.QUEUE_FLUSH, map);


                            } else{
                                Toast.makeText(getApplicationContext(), "TTS initialization failed",
                                        Toast.LENGTH_LONG).show();
                            }

                        }
                    }
                });
            } else {
                // Data is missing, so we start the TTS
                // installation process
                Intent installIntent = new Intent();
                installIntent.setAction(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
                startActivity(installIntent);
            }


        }
        else if(requestCode == BEACON_SENSE){
            starting = true;
            t1.speak(DESTINATION_STRING, TextToSpeech.QUEUE_FLUSH, map);
            //termina la trayectoria
            Log.i("beacon", "siacabo");
        }

        else if (requestCode == REQ_CODE_SPEECH_INPUT) {
            if (resultCode == RESULT_OK && null != data) {

                ArrayList<String> result = data
                        .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                json_dest = new JSONObject();

                try {
                    if (result.get(0).contains("kitchen")) {
                        starting = false;
                        json_dest.put("place", "kitchen");
                        ConsultaWeb cw = new ConsultaWeb(getApplicationContext(), json_dest);
                        cw.execute();
                    }
                    else
                        t1.speak(DESTINATION_STRING, TextToSpeech.QUEUE_FLUSH, map);

                }catch(JSONException e)
                {}
            }
            else{
                t1.speak(DESTINATION_STRING, TextToSpeech.QUEUE_FLUSH, map);
            }
        }
    }

    private void askSpeechInput() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 2000);
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT,
                "Hi speak something");
        try {
            startActivityForResult(intent, REQ_CODE_SPEECH_INPUT);
        } catch (ActivityNotFoundException a) {

        }
    }



    @Override
    public void onDestroy(){
        if(t1 != null){
            t1.stop();
            t1.shutdown();
        }
        super.onDestroy();

    }

    public class ConsultaWeb extends AsyncTask<Void, Void, String> {


        private JSONObject json;
        private Context context;

        public void setJSON(JSONObject json){

            this.json = json;
        }

        ConsultaWeb(Context context, JSONObject json){
            this.context = context;
            this.json = json;
        }


        @Override
        protected String doInBackground(Void... param) {

            String respuesta = "";
            Conexion conn = new Conexion(context);

            try {
                Log.i("queon", "da");
                URL url = new URL("http://192.168.1.77:8845/cgi-bin/hello.py");//"192.168.1.77");
                Log.i("queon", "da2 " + json.toString());
                respuesta = conn.connectToSite(url, json);
                Log.i("queon", "da3");




            }catch(Exception e){
                return "";
            }



            return respuesta;
        }



        protected void onPostExecute(final String success) {

            if(success != null && ! success.isEmpty()) {
                Log.i("onPostExecute", success);
                //taskCompletionResult(success);
                try {
                    JSONObject json = new JSONObject(success);

                    try {
                        t1.speak(json.getString("linear"), TextToSpeech.QUEUE_FLUSH, map);
                    } catch (JSONException e) {
                    }


                    try {
                        t1.speak(json.getString("angular"), TextToSpeech.QUEUE_FLUSH, map);
                        //Log.i("que", Boolean.toString(t1.isSpeaking()));

                    } catch (JSONException e) {
                    }

                    try {
                        t1.speak(json.getString("end"), TextToSpeech.QUEUE_FLUSH, null);
                        Intent myIntent = new Intent(getApplicationContext(), RangingActivity.class);
                        startActivityForResult(myIntent, BEACON_SENSE);
                    } catch (JSONException e) {
                    }

                } catch (JSONException e) {
                }
            } else {

            }

        }

        @Override
        protected void onCancelled() {


        }
    }


    class SpeechUtteranceListener extends UtteranceProgressListener {

        @Override
        public void onDone(String utteranceId) {
            Log.i("aqt", "ta2232");

            if(starting){
                Log.i("aqt", "ta");
                askSpeechInput();
            }
            else {
                Log.i("ahi", "estas");
                ConsultaWeb cw = new ConsultaWeb(getApplicationContext(), json_dest);
                cw.execute();
            }

        }

        @Override
        public void onError(String utteranceId) {

        }

        @Override
        public void onStart(String utteranceId) {

        }
    }

}
