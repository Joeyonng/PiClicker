
#!/usr/bin/env python3
import sys
import requests
import socket
import os

report_0112aa00 = b'\x01\x12\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_0132aa00 = b'\x01\x32\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_011eaa00 = b'\x01\x1e\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_01150057 = b'\x01\x15\x00\x57\x05\x04\x21\x43\x01\x00\x66\x00\x07\x00\x04\x12\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_01220000 = b'\x01\x22\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_0110aa00 = b'\x01\x10\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_0111aa00 = b'\x01\x11\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_0119aa00 = b'\x01\x19\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_0116aa00 = b'\x01\x16\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_01220000 = b'\x01\x22\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_0129aa00 = b'\x01\x29\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_012aaa00 = b'\x01\x2a\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_022c0000 = b'\x02\x2c\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

# first 63 bytes of cmd message 1 is identical to cmd_end_poll
# first 63 bytes of cmd message 4 is identical to cmd_start_session

cmd_connect_message_1 = b'\x01\x12\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
cmd_connect_message_2 = b'\x012\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
cmd_connect_message_3 = b'\x01\x1e\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
cmd_connect_message_4 = b'\x01\x15\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
cmd_connect_message_5 = b'\x01"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
cmd_connect_message_6 = b'\x01\x10!A`\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

cmd_disconnect = b'\x01\x14    USB Base    \x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

# cmd_connect_message_[1-4] are ID'd so only check the first 63 bytes. 5 and 6 are not ID's and not used rn.
# disconnect is also ID'd
# the commands below all have IDs attached for their last byte so I only included here and check for the command to match the first 63 bytes since the last one isnt always going to match

cmd_start_session = b'\x01\x15\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
cmd_start_poll = b'\x01\x19\x66\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
cmd_end_poll = b'\x01\x12\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

host = '0.0.0.0'
port = 8080
addr = (host, port)

classID = 1
sessionID = 0
pollID = 0


def hid_main():
    print("HID Main")
    while True:
        out = read()
        if(out[0] == 0):
            print("Found Glitch")
            index = out.index(1)
            with open("/dev/hidg0", "rb+") as fd:
                fd.read(index)
                print("Fixed Glitch")
        if out[:63] == cmd_end_poll:
            if(out[63] == 0 or out[63] == 1 or out[63] == 2 or out[63] == 3 or out[63] == 4 or out[63] == 5 or out[63] == 6):
                start_up()
            end_poll()
        elif out[:63] == cmd_start_session:
            start_session()
        elif out[:63] == cmd_start_poll:
            start_poll()
        elif out[:63] == cmd_disconnect:
            disconnect()


def start_up():
    print("Starting Connection")
    write_report(report_0112aa00)
    if(read()[:63] != cmd_connect_message_2):
        return
    write_report(report_0132aa00)
    read()
    write_report(report_011eaa00)
    read()
    write_report(report_01150057)
    read()
    write_report(report_01220000)
    read()
    write_report(report_0110aa00)
    read()
    write_report(report_011eaa00)
    read()
    write_report(report_0116aa00)
    read()
    read()
    print("Started iClicker")


def disconnect():
    print("Disconnected")


def start_session():
    global sessionID
    print("Received Start iClicker Session")
    write_report(report_01150057)
    if(read() == cmd_connect_message_5):
        return
    write_report(report_0112aa00)
    read()
    write_report(report_011eaa00)
    read()
    write_report(report_01150057)
    read()
    write_report(report_01220000)
    read()
    write_report(report_0110aa00)
    read()
    write_report(report_011eaa00)
    read()
    write_report(report_0116aa00)
    read()
    write_report(report_0129aa00)
    read()
    write_report(report_01150057)
    read()
    write_report(report_0112aa00)
    read()
    write_report(report_011eaa00)
    read()
    write_report(report_012aaa00)
    write_report(report_022c0000)
    read()
    write_report(report_01150057)
    read()
    write_report(report_01220000)
    read()
    write_report(report_0110aa00)
    read()
    write_report(report_011eaa00)
    read()
    write_report(report_0116aa00)
    response = requests.post(
        "http://localhost:8888/createSession", json={"classID": classID})
    if(response.json()["success"] == True):
        print("Started iClicker Session")
        sessionID = response.json()["sessionID"]
        print(f"SessionID: {sessionID}")
        return
    print("iClicker Session Not Started! Try Again!")


def start_poll():
    global pollID
    print("Receivced Start iClicker Poll")
    write_report(report_0119aa00)
    read()
    write_report(report_0111aa00)
    response = requests.post("http://localhost:8888/createPoll",
                             json={"sessionID": sessionID, "activateOnCreate": True})
    if(response.json()["success"] == True):
        print("Started iClicker Poll")
        pollID = response.json()["pollID"]
        print(f"PollID: {pollID}")
        return
    print("iClicker Poll Not Started! Try Again!")


def end_poll():
    print("Received End iClicker Poll")
    write_report(report_0112aa00)
    read()
    write_report(report_0119aa00)
    read()
    write_report(report_0116aa00)
    read()
    read()
    response = requests.post("http://localhost:8888/deactivatePoll")
    if(response.json()["success"] != True):
        print("Couldn't Deactivate Poll On Server (This Is Ok, It Will Be Done During Activation)")
    print("Ended iClicker Poll")


def read():
    with open('/dev/hidg0', 'rb+') as fd:
        output = fd.read(64)
        return output


def write_report(report):
    with open('/dev/hidg0', 'rb+') as fd:
        fd.write(report)


if __name__ == "__main__":
    with open('./Pathway', 'r+') as o:
        pathway = o.readline()
        print(pathway)
        if pathway == "GEther\n":
            server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server.bind(addr)
            server.listen(5)
            conn, client_addr = server.accept()

            if os.path.isfile("computer_ip"):
                os.remove("computer_ip")

            with open("computer_ip", "w+") as w:
                w.write(client_addr[0])
                w.close()
            server.close()
            exit
        elif pathway == "HID\n":
            hid_main()
