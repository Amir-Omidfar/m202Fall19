package com.ucla.earablesinterface;

import java.util.Collection;

import android.app.Activity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.os.RemoteException;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import com.ucla.DirectMe.R;

import org.altbeacon.beacon.AltBeacon;
import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.BeaconConsumer;
import org.altbeacon.beacon.BeaconManager;
import org.altbeacon.beacon.BeaconParser;
import org.altbeacon.beacon.Identifier;
import org.altbeacon.beacon.RangeNotifier;
import org.altbeacon.beacon.Region;
import org.altbeacon.beacon.powersave.BackgroundPowerSaver;

import androidx.core.view.GestureDetectorCompat;

import static java.lang.Math.abs;

public class RangingActivity extends Activity implements BeaconConsumer {
    protected static final String TAG = "RangingActivity";
    private BeaconManager beaconManager;
    private BackgroundPowerSaver backgroundPowerSaver;
    private VibrationEffect vb;
    private long[] timings = {10, 10};
    private boolean end = false;
    Vibrator vibrator;
    private GestureDetectorCompat mDetector;
    private TextView rssi_txt;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ranging);
        beaconManager = BeaconManager.getInstanceForApplication(this);
        beaconManager.getBeaconParsers().clear();
        beaconManager.getBeaconParsers().add(new BeaconParser().
                setBeaconLayout("m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24"));
        //backgroundPowerSaver = new BackgroundPowerSaver(this);
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        mDetector = new GestureDetectorCompat(this, new MyGestureListener());
        rssi_txt = (TextView) findViewById(R.id.textview);

    }

    @Override
    public boolean onTouchEvent(MotionEvent event){
        this.mDetector.onTouchEvent(event);
        return super.onTouchEvent(event);
    }


    class MyGestureListener extends GestureDetector.SimpleOnGestureListener {
        private static final String DEBUG_TAG = "Gestures";

        @Override
        public boolean onDown(MotionEvent event) {
            Log.d(DEBUG_TAG,"onDown: " + event.toString());
            return true;
        }

        @Override
        public boolean onSingleTapUp(MotionEvent event) {
            Log.d(DEBUG_TAG, "onSingleTapUp: " + event.toString());
            vibrator.cancel();
            finish();
            return true;
        }

    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        beaconManager.removeAllRangeNotifiers();
        beaconManager.unbind(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        beaconManager.removeAllRangeNotifiers();
        beaconManager.unbind(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        beaconManager.bind(this);
    }

    private int[] getAmplitudes(int rssi){

        int [] amps = new int[2];



        if(abs(rssi) > 60)
            amps[0] = amps[1] = 0;

        else if(abs(rssi) < 35)
            amps[0] = amps[1] = 255;

        else
            amps[0] = amps[1] = (int) (-10.2*abs(rssi) + 612);

        return amps;

    }

    @Override
    public void onBeaconServiceConnect() {
        beaconManager.removeAllRangeNotifiers();
        RangeNotifier rangeNotifier = new RangeNotifier() {
            @Override
            public void didRangeBeaconsInRegion(Collection<Beacon> beacons, Region region) {

                if (beacons.size() > 0) {
                    //Log.d(TAG, "didRangeBeaconsInRegion called with beacon count:  "+beacons.size());
                    Beacon firstBeacon = beacons.iterator().next();
                    Log.i("beacon", Integer.toString(firstBeacon.getRssi()));
                    rssi_txt.setText(String.format("Distance: %.2f m", Beacon.getDistanceCalculator().calculateDistance(firstBeacon.getTxPower(), firstBeacon.getRssi())));

                    //logToDisplay("The first beacon " + firstBeacon.toString() + " is about " + firstBeacon.getDistance() + " meters away. " + firstBeacon.getRssi() + "  " + firstBeacon.getRunningAverageRssi());
                    if (vibrator.hasVibrator()) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            vb = VibrationEffect.createWaveform(timings, getAmplitudes(firstBeacon.getRssi()), 0);
                            vibrator.vibrate(vb);
                        }
                    }
                }
            }

        };
        try {

            beaconManager.startRangingBeaconsInRegion(new Region("myRangingUniqueId", Identifier.parse("426C7565-4368-6172-6D42-6561636F6E73"), Identifier.parse("3838"), Identifier.parse("4949")));
            beaconManager.addRangeNotifier(rangeNotifier);
            //beaconManager.startRangingBeaconsInRegion(new Region("myRangingUniqueId", Identifier.parse("426C7565-4368-6172-6D42-6561636F6E73"), Identifier.parse("3838"), Identifier.parse("4949")));
            //beaconManager.addRangeNotifier(rangeNotifier);
        } catch (RemoteException e) {   }
    }

}

