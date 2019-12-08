package com.ucla.earablesinterface;

import android.content.Context;
import android.database.Cursor;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

public class Conexion {

    private Context context;

    Conexion(Context context){
        this.context = context;
    }


    public String connectToSite2(URL url) throws IOException {
        String respuesta = "";


        HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
        try {

            urlConnection.setDoInput(true);
            urlConnection.setRequestMethod("GET");

            InputStream in = new BufferedInputStream(urlConnection.getInputStream());
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));

            respuesta = reader.readLine();
            reader.close();
            in.close();


        } catch (Exception e) {

            System.out.println(e.getMessage());
        } finally{
            urlConnection.disconnect();
        }

        return respuesta;
    }

    public String connectToSite(URL url, JSONObject jo) throws IOException{

        String respuesta = "";
        String post_info = URLEncoder.encode("q", "UTF-8") +
                "=" + URLEncoder.encode(jo.toString(),"UTF-8");

        HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
        try {
            urlConnection.setReadTimeout(15000);
            urlConnection.setConnectTimeout(15000);
            urlConnection.setDoOutput(true);
            //urlConnection.setDoInput(true);
            urlConnection.setRequestMethod("POST");
            urlConnection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            urlConnection.setFixedLengthStreamingMode(post_info.getBytes().length);



            OutputStream out = new BufferedOutputStream(urlConnection.getOutputStream());
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(out, "UTF-8"));

            writer.write(post_info);
            writer.flush();
            writer.close();
            out.close();

            InputStream in = new BufferedInputStream(urlConnection.getInputStream());
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));

            respuesta = reader.readLine();
            reader.close();
            in.close();


        } catch (Exception e) {

            System.out.println(e.getMessage());
            respuesta = e.getMessage();
        } finally{
            urlConnection.disconnect();
        }

        return respuesta;
    }
}
