<?php

//This proof of concept PHP code is created for Data Minded in the MERLIN trial.
//Given a collection, look for sub-collections and in the sub-collections search for files.  Files older than 1 day (configurable) are ignored. Folders and files will be downloaded and create locally.  Makes use of https://github.com/tcdent/php-restclient

$interval = 86400; #Last 24 Hours
require 'restclient.php';
$base_dir = "collection/ritZone/demo_ingest/bla/bla";
$api = new RestClient(array(
    'base_url' => "http://fhml-srv018.unimaas.nl:8080/irods-rest/rest/",
    'username' => "d.theunissen",
    'password' => "foobar",
));
$result = $api->get($base_dir, [
    'contentType' => "application/json",
    'listing' => 'true'
]);
 
$json =  $result->response;
$decoded_json = json_decode($json);
$children = $decoded_json->{'children'};
foreach ($children as $v) {
    if ($v->{'objectType'} == "COLLECTION"){
        processCollection($v->{'pathOrName'});
    }
}
function processCollection($dir )
{
    global $interval;
    $base = basename($dir);
    $api = new RestClient(array(
        'base_url' => "http://fhml-srv018.unimaas.nl:8080/irods-rest/rest/",
        'username' => "d.theunissen",
        'password' => "foobar",
    ));
    $result = $api->get("collection/".$dir, [
        'contentType' => "application/json",
        'listing' => 'true'
    ]);
    $json =  $result->response;
    $decoded_json = json_decode($json);
    $children = $decoded_json->{'children'};
    foreach ($children as $v) {
        if ($v->{'objectType'} == "DATA_OBJECT"){
            $epoch = $v->{'modifiedAt'};
            $epoch = substr($epoch,0,10);
            $dt = new DateTime("@$epoch");
            $dt->setTimeZone(new DateTimeZone('Europe/Amsterdam'));
            $epoch = $dt->getTimestamp();
            $now = new DateTime();
            $now_epoch= $now->getTimestamp();           // Unix Timestamp -- Since PHP 5.3
            $dur = ($now_epoch- $epoch);
            if ( $dur < $interval ){
                $base = basename($dir);
                if (!file_exists($base)) {
                    mkdir($base);
                }
                processFile($v->{'pathOrName'},$v->{'parentPath'});
            }
        }
    }
}
function processFile($file,$base){
    $directory = basename($base);
    $url =  "http://fhml-srv018.unimaas.nl:8080/irods-rest/rest/" . "fileContents".$base."/".$file;
    $url = str_replace ( ' ', '%20', $url);
    $username='d.theunissen';
    $password='foobar';
    $path = $directory . "/".$file;
    $fp = fopen($path, 'w');
    $ch = curl_init($url);
    curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 0);
    curl_setopt ($ch, CURLOPT_TIMEOUT, 0);
    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
    $data = curl_exec($ch);
    curl_close($ch);
    fclose($fp);
}
?> 
