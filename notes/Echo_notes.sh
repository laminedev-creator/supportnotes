#!/bin/bash



			#APP VOLUME
/store/docker/volumes/qapp-xxxx/
/opt/qradar/bin/app-volume-backup.py
# The backup archives are stored in: /store/apps/backup/
			
		#Inside a docker container logs can be found under:
			#Centos 6 based app: 
/store/log
			#UBI based app:
/opt/app-root/store/log
			
		#Qradar Logs
/var/log/qradar.error
/var/log/localca.log 
/var/log/qradar/app/docker_build/docker_build.log
			
			
			#Conman
			/var/log/qradar/conman.log
			
			/opt/qradar/ca/bin/si-qradarca generate -config /opt/qradar/ca/conf.d/docker-engine-client-registry.json -force -ip 131.202.2.50
			
		#Registry
			#Test with:
curl -v https://console.localdeployment:5000/v2/_catalog --key /etc/docker/tls/registry/docker-client-registry.key --cert /etc/docker/tls/registry/docker-client-registry.cert
			
			#Remove dangling images:
docker rmi -f $(docker images -f "dangling=true" -q)
			#Rebuild registry:
/opt/qradar/bin/docker_apps_registry_restore.sh
			#Then rebuild images:
/opt/qradar/bin/upgrade_applications.sh
			#Find the Apphost:
psql -U qradar -c "select * from managedhost where appliancetype like '%4000%';"

			#installed_application(only on console) table
psql -U qradar -c "select id, name, status, task_status, lock, memory, errors, image_repo,managed_host_id from installed_application;"
			
			#Memory
docker stats
psql -U qradar -c "select sum(memory) from installed_application;"
			#Recon
/opt/qradar/support/recon ps
/opt/qradar/support/recon connect IID
			systemctl daemon-reload

psql -U qradar -c "select id,sessiontoken,servicename from authorized_service;"

java -jar /opt/qradar/jars/ibm-si-mks.jar decrypt "AQAAAAAAAAABe1NHMWislMANuhsm+cFQRm8BKoqt8YHJ74YujBWQ4e5JebuEYUz2ZxMpFSibATQ3vNP8hn2rm0o48Yd0i8cV8Q=="
or
echo AQAAAAAAAAABjjSF/bL0tRAF4nQEIP29jCkUGZeZmU3OxAAESnSafpiLDFJPK9tHYrzw2Ue4Hn8QwkKOFdyuKg07RWSL9uwFKg==
 | java -jar /opt/qradar/jars/ibm-si-mks.jar decrypt_command_line 


AQAAAAAAAAABjjSF/bL0tRAF4nQEIP29jCkUGZeZmU3OxAAESnSafpiLDFJPK9tHYrzw2Ue4Hn8QwkKOFdyuKg07RWSL9uwFKg==

	#Certificats
/opt/qradar/ca/bin/si-qradarca list -print
/opt/qradar/support/validate_cert.sh | grep -i expire

		#Check the app framework CSRs on both console and app host and ensure that they match the output of myver -vh & myver -vi:	
		TS015365378
/opt/qradar/bin/myver -vh 
/opt/qradar/bin/myver -vi

		#View CSR(Apphost & Console)
find /etc/ -name "*.csr" -type f | xargs ls –lhtr
		#Open 1 CSR:
openssl req -text -noout -verify -in '<path_to_csr_file>'
		#Verify CRSs:
for i in 'find /etc/ -type f -name "*.csr"'; do openssl req -text -noout -verify -in $i | grep -i DNS;done	
	
		# On the console, check and make sure that the the app frmaework certs haven't expired:
for i in `/opt/qradar/ca/bin/si-qradarca list -print | awk -F ',' '{print $4}'`; do echo $i; openssl x509 -in $i -noout -enddate; done
		#Check certs:
			#On Console:
 for c in $(/opt/qradar/ca/bin/si-qradarca list -print | grep -v '^$' | cut -d, -f4 | grep '^/'); do openssl verify $c ;done
			#On Apphost:
for i in $(find /etc/conman/tls /etc/traefik/tls /etc/docker/tls /etc/vault-qrd/tls /etc/httpd/conf/certs /etc/pki/ca-trust/source/anchors -type f \( -name "*.cert" -o -name "*.pem" -o -name "*.crt" \));do echo $i; openssl verify -CAfile /etc/pki/tls/cert.pem $i; done
			
	

	
	#Regen CSR
			
			egrep "$(hostname)|$(/opt/qradar/bin/myver -ih)" /etc/hosts
				#The old CSR files should be moved out to a different directory using:
for i in 'find /etc/ -type f -name "*.csr"'; do mv $i /store/ibm_support/TS011223516; done
			
			#Tomcat(console only):
/opt/qradar/tomcat/ create_tomcat_client_conman_cert.sh
/opt/qradar/tomcat/create_tomcat_client_traefik_cert.sh
			#Docker(app host or console):
/opt/ibm/si/si-docker/bin/configure-docker-daemon.sh
			#Si-Registry(console only):
/opt/ibm/si/si-registry/bin/configure-si-registry.sh
			#Traefik(app host or console):
/opt/ibm/si/traefik/bin/configure-traefik.sh
			#Conman(app host or console):
/opt/ibm/si/conman/bin/configure-conman.sh
			#Vault-Qrd(app host or console):
/opt/ibm/si/vault-qrd/bin/setup-vault-qrd.sh --uninstall
/opt/ibm/si/vault-qrd/bin/setup-vault-qrd.sh --init
			#Postfix 7.4.1FP2+ (app host or console):
/opt/ibm/si/si-postfix/bin/configure-postfix-tls.sh

			
			#Reset
			#(ALLWAYS ON CONSOLE)
			
				#If custom httpd cert (QRoC safe):
sed -e "s@\"CertSkip\":[ \t]*\".*\"@\"CertSkip\": \"true\"@" -i /opt/qradar/ca/conf.d/httpd.json; /opt/qradar/ca/bin/reset-qradar-ca.sh all --reset

			
				#if no custom httpd cert (This will break QRoC):
rm -rf /opt/qradar/ca/certs/*; /opt/qradar/ca/bin/reset-qradar-ca.sh all --reset
				#Reset 1 By 1
/opt/qradar/ca/bin/reset-qradar-ca.sh 17 --reset
				#Reset on MH
				cd /storetmp;rm -f /opt/qradar/ca/certs/from-172.16.215.180/*; /opt/qradar/ca/bin/si-qradarca generate -debug -csr -ip 172.16.215.180
				#Push the docker registry data (on the console) 
/store/docker-data/images/deliver.sh push
				
				#Ensure the vault tokens exist on both console and app host
/opt/qradar/token/bin/vault-token list -all
				
				#If the no vault tokens exist (the above command returns a blank), generate new vault tokens:
/opt/qradar/token/bin/vault-token token -all
				
				#Deploy changes (Admin > Deploy Changes) 
				#or
/opt/qradar/upgrade/util/setup/upgrades/do_deploy.pl
				#Restart services:
systemctl stop hostcontext && systemctl restart tomcat && systemctl start hostcontext
				
				
		#APP SPECIFIC
			#Threat Intel 
curl -I -k -L https://api.xforce.ibmcloud.com
curl -I -k -L https://taxii-api.xforce.ibmcloud.com
				
		#Change Zip file Path:
psql -U qradar -c "update installed_application set zip_source_file_path='/store/qapp/1254/1254.zip' where id=1254;"
psql -U qradar -c "select id,name,zip_source_file_path from  installed_application";
		
		#App Content_package
psql -U qradar -c "select id,name,file_location,hub_id,content_status from content_package where hub_id ilike '%Hive%'";
psql -Uqradar "select id,name,file_location,hub_id,content_status from content_package where hub_id = 'IBMQRadar:UserBehaviorAnalytics'";
	
		#Change app status:

psql -Uqradar -c "update installed_application set status='COMPLETED' where id=1960;"
psql -Uqradar -c "update installed_application_instance set status='STOPPED', task_status='COMPLETED' where id=1103";



echo -n "Sockets: "; lsof -p $(systemctl status tomcat | grep "Main PID" | awk '{print $3}') |grep -i " sock " |wc -l; echo -n "Files: "; lsof -p $(systemctl status <service affected> |grep "Main PID" | awk '{print $3}') |wc -l

echo -n "Sockets: "; lsof -p $(systemctl status tomcat | grep "Main PID" | awk '{print $3}') |grep -i " sock " |wc -l; echo -n "Files: "; lsof -p $(systemctl status <service affected> | grep "Main PID" | awk '{print $3}') |wc -l

https://api.xforce.ibmcloud.com/taxii


curl -I -k -L  https://api.xforce.ibmcloud.com

App DNS settings: /etc/docker/daemon.json




curl -S -X POST -H 'sec:8041bb2c-d4a9-4d59-b688-d13ae67b6656' -H 'Version: 20.0' -H 'Accept: application/json' 'https://console-00136b.qradar.ibmcloud.com/api/ariel/searches?query_expression=SELECT%20*%20FROM%20events%20WHERE%20%28%20LOWER%28username%29%20in%20%28%27aurineide.ferreira%40gps-pamcary.com.br%27%2C%27aurineide.ferreira%40gps-pamcary.local%27%2C%27aurineide.ferreira%40pamcary.com.br%27%2C%27cn%3Daurineide%20rodrigues%20ferreira%2Cou%3Dusers%2Cou%3Dmatriz%2Cou%3Dspo%2Cou%3Dbr%2Cdc%3Dgps-pamcary%2Cdc%3Dlocal%27%2C%27tec15%27%29%20%29%20AND%20devicetype%20not%20in%20%2816%2C%20105%2C%20147%2C%20262%2C%20267%2C%20275%2C%20355%2C%20368%2C%20500%29%20AND%20islogonly%3DFALSE%20AND%20NOT%20%28LOGSOURCEGROUPNAME%28devicegrouplist%29%20%3D%20%27UBA%20%3A%20Trusted%20Log%20Source%20Group%27%29%20and%20QIDNAME%28qid%29%20%3D%20%27UBA%20%3A%20Abnormal%20increase%20in%20Authentication%20activity%27%20START%201723431600000%20STOP%201723471199999'
curl -S -X GET -H 'sec:8041bb2c-d4a9-4d59-b688-d13ae67b6656' -H 'Range: items=0-49' -H 'Version: 20.0' -H 'Accept: application/json' 'https://console-00136b.qradar.ibmcloud.com/api/ariel/searches/c0b06bef-e9d3-482d-bf1d-500c617ccbc4/results'

