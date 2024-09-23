
	#SSH
			#Host asking pswd:
sh-copy-id user@host

	#MKS
		#Regardless of this is a Console or Managed Host we can try to decrypt.  First we can pull some of the passwords from frameworks.properties:
grep -i pass /opt/qradar/conf/frameworks.properties

		#We can test decryption with:
java -jar /opt/qradar/jars/ibm-si-mks.jar decrypt "XXXXXXXXXXXXXXXXX=="
		#Output should give you something, the unencrypted password.   If it fails we'll get the failed to decrypt message.

		#We can also test all decryptions with:  
/opt/qradar/support/mks_validate.py -a CONNECTION

	#Token Encryption
perl -I /opt/qradar/lib/Q1/ -e "use auCrypto; print Q1::auCrypto::encrypt('e77d7009-5cf7-4d7d-bc7d-3562b1c81a56');"

	#Deploys:
/opt/qradar/bin/qradar_has_undeployed_changes.py -v
/opt/qradar/upgrade/util/setup/upgrades/do_deploy.pl

	#Storage:
		#File that uses space:
du -sckh /store/*

		#Partition disk usage:
df -h
		#Check all MH /store partitions:
for dn in $(/opt/qradar/support/deployment_viewer.py -mh 125 | grep -i datanode | sort | uniq | awk '{print $NF}'); do grep $dn /etc/hosts; ssh $dn 'df -Th /store | grep store'; done | column -t

	#PSQL
		#Column names can be found per table by running:
\d+ <table_name>

		#Enabling expanded formatting
qradar=# \x auto

		#By temporarily changing the pager to less, query outputs are displayed horizontally but with all of the functionality of less: 
export PAGER='less –iS'

		#Exporting output to a text friendly CSV file from the command line: 
psql-U qradar-c "select * from [table]" > [directory path][file name].csv

		#To enable postgres debug logging :
			#In 
/store/postgres/data/postgresql.conf 
			#uncomment line 
log_statement=all
			#Then restart postgres 
systemctl restart postgresql-qrd
			#Written to /var/log/qradar-sql.log 
			#lways be sure to disable debug logging when finished.



	#DBRD/Rsync/HA
		#Check dbrd:
cat /proc/dbrd
systemctl status drbd
cat /etc/dbrd.conf
mount |grep dbrd #(/dev/dbrd0 Should be on /store)

	#Crossover
/opt/qradar/ha/bin/qradar_nettune.pl crossover status
/opt/qradar/ha/bin/qradar_nettune.pl crossover test fast

	#Qchange:
/opt/qradar/bin/qchange_console_ip.sh
/opt/qradar/bin/qchange_netsetup


	#cd /storetmp/
fallocate -l 1G test


	#Patch
		#Logging is in:
/var/log/setup-<version>/patches.log
	#Tomcat :
/opt/qradar/bin/test_tomcat_connection.sh
grep test_tomcat /var/log/qradar.log
	#Catalina
/opt/tomcat85/logs/catalina.log


	#Log ingesting
		#tcp dump:
tcpdump -nnAs0 -v -i any src host <ip_device> and port 514
		#Events from today:
ls -l /store/ariel/events/records/(today)/



	#Upgrade
		#Logging in is:
/var/log/setup-<version>/qradar.netsetup.log

		#If you are every looking for the history of a customer's patching you can run this command to give you the details:
egrep "Running|Applied" /var/log/install.log


	#Performance
		#Big Reference sets:
psql -U qradar -c "select id,name,time_to_live,current_count from reference_data where current_count > 4000 order by current_count desc;"
		#Running queries:
		/opt/qradar/support/jmx.sh -p 7782 -b 'com.q1labs.ariel:application=ariel_proxy.ariel_proxy_server,type=Query server,a1=Queries,a2=NORMAL,a4=ee8e5952-9b2b-4ab7-8733-1f45d8adb84d'

		#When you find such a long running search, you can just copy the ID as I showed, and try to find where it comes from by greping in the audit logs.
		grep -i 'a4=7500708d-f2cb-425a-a9d6-950ae1d64192 ' /var/log/audit/audit.log | grep -i 'SearchExecuted'
		#Expensive searches:
watch -n1 "/opt/qradar/support/jmx.sh -p 7782 -b 'Queries.*' --tabular -a Duration -a Progress"
	
		#DB Size:
psql -U qradar -c "select * from q_db_size";

	#Replication
		#Check on all MH : 
/opt/qradar/support/all_servers.sh -C "psql -U qradar -c 'SELECT id FROM replication_sync ORDER BY id DESC LIMIT 1;'"

	#Tunneling
		#In an encrypted environment, you can convert this "port" number to a host address, by finding the IP address, and specific tunnel from the associated port entry in deployment.xml :
grep '32012' /opt/qradar/conf/deployment.xml
