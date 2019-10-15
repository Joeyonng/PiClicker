import fileinput
import os
import shutil
import sys

newChannel = f"channel={sys.argv[1]}\n"
with open('/etc/hostapd/hostapd.conf', 'r') as op, open('temp.txt', 'w') as wr:
    for line in op:
        if line[:8] == "channel=":
            wr.write(newChannel)
        else:
            wr.write(line)

os.remove('/etc/hostapd/hostapd.conf')
shutil.move('temp.txt', '/etc/hostapd/hostapd.conf')
os.system('service hostapd restart')
