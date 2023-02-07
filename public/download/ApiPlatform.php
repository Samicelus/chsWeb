<?php
	class ApiPlatform{
	    private static $TOKEN_EXPIRE = 22 * 60 * 60;
        private static $serverUrl = "";
        private static $login = "";
        private static $password = "";
        private static $JWT = "";
        private static $EXPIRE = 0;

        function __construct( $serverUrl, $login, $password ) {
            self::$serverUrl = $serverUrl;
            self::$login = $login;
            self::$password = $password;
            self::$JWT = "";
            self::$EXPIRE = 0;
        }

        public static function getJWT(){
            $now = time();
            if($now < self::$EXPIRE){
                return self::$JWT;
            } else {
                $ch = curl_init();
                $params = array();
                $params['login'] = self::$login;
                $params['password'] = self::$password;

                curl_setopt($ch, CURLOPT_URL, self::$serverUrl.'/v1/public/user/getToken');
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
                curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS,8000);
                curl_setopt($ch, CURLOPT_TIMEOUT_MS, 30000);
                curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
                curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,false);

                $response = curl_exec($ch);
                $resinfo = curl_getinfo($ch);
                curl_close($ch);

                if($resinfo["http_code"] != 200){
                    throw new Exception("response status code is not valid. status code: ".$resinfo["http_code"]);
                }

                $result = json_decode(trim($response), true);

                $token = $result["token"];

                self::$JWT = $token;

                self::$EXPIRE = $now + self::$TOKEN_EXPIRE;

                return $token;
            }
            
        }

        public static function getCompanyApiList($company_id){
            $token = self::getJWT();
            $headers = array();
            $headers[] = 'b-json-web-token:'.$token;
            $params = array();
            $params['company_id'] = $company_id;

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, self::buildGetUrl(self::$serverUrl.'/v1/public/api/companyApis', $params));
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS,8000);
            curl_setopt($ch, CURLOPT_TIMEOUT_MS, 30000);

            $response = curl_exec($ch);
            $resinfo = curl_getinfo($ch);
            curl_close($ch);

            if($resinfo["http_code"] != 200){
                throw new Exception("response status code is not valid. status code: ".$resinfo["http_code"]);
            }

            $result = json_decode(trim($response), true);

            return $result;
        }

        public static function callApi($company_id, $tagName, $params){
            $token = self::getJWT();            
            $body = array();
            $body['company_id'] = $company_id;
            $body['tagName'] = $tagName;
            $body['params'] = $params;
            $data = json_encode($body);
            $headers = array(
                'b-json-web-token:'.$token,
                'Content-Type: application/json; charset=utf-8',
                'Content-Length:' . strlen($data),
                'Cache-Control: no-cache',
                'Pragma: no-cache'
            );

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, self::$serverUrl.'/v1/public/api/call');
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS,8000);
            curl_setopt($ch, CURLOPT_TIMEOUT_MS, 30000);
            curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
            curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,false);

            $response = curl_exec($ch);
            $resinfo = curl_getinfo($ch);
            curl_close($ch);

            if($resinfo["http_code"] != 200){
                throw new Exception("response status code is not valid. status code: ".$resinfo["http_code"]);
            }

            $result = json_decode(trim($response), true);

            return $result;
        }

        public static function buildGetUrl($strUrl, $params){
            if ($params == null || count($params) == 0) {
                return $strUrl;
            }
            $buildUrlParams = http_build_query($params);
            if(strrpos($strUrl,'?',0) != (strlen($strUrl) + 1)){ //最后是否以？结尾
                return $strUrl.'?'.$buildUrlParams;
            }
            return $strUrl.$buildUrlParams;
        }
    }
?>