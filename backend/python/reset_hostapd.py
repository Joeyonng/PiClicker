import fileinput
import os
import shutil
import sys

defaultSSID = "ssid=PiFi\n"
defaultPass = "wpa_passphrase=piclickerucsd\n"
defaultChannel = "channel=1\n"
with open('/etc/hostapd/hostapd.conf', 'r') as op, open('temp.txt', 'w') as wr:
    for line in op:
        if line[:5] == "ssid=":
            wr.write(defaultSSID)
        elif line[:15] == "wpa_passphrase=":
            wr.write(defaultPass)
        elif line[:8] == "channel=":
            wr.write(defaultChannel)
        else:
            wr.write(line)

os.remove('/etc/hostapd/hostapd.conf')
shutil.move('temp.txt', '/etc/hostapd/hostapd.conf')
os.system('service hostapd restart')
