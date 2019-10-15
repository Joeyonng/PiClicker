import fileinput
import os
import shutil
import sys

newSSID = f"ssid={sys.argv[1]}\n"
newPassword = f"wpa_passphrase={sys.argv[2]}\n"
with open('/etc/hostapd/hostapd.conf', 'r') as op, open('temp.txt', 'w') as wr:
    for line in op:
        if line[:5] == "ssid=":
            wr.write(newSSID)
        elif line[:15] == "wpa_passphrase=":
            wr.write(newPassword)
        else:
            wr.write(line)

os.remove('/etc/hostapd/hostapd.conf')
shutil.move('temp.txt', '/etc/hostapd/hostapd.conf')
os.system('service hostapd restart')
