#!/usr/bin/env python3
import sys
import socket
import os

report_open_display = b'\xaa\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_close_display = b'\xbb\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_reset_display = b'\xcc\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
report_record_responses = b'\xd1\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

o = open("computer_ip", "r")
host = o.read()
o.close()
#host = "LAPTOP-3O9OFR63.local"
port = 8080
addr = (host, port)


def main():
    count = 0
    while True:
        cmd = input()
        if(cmd == "open"):
            open_display()
        elif(cmd == "close"):
            close_display()
        elif(cmd == "reset"):
            reset_display()
        elif(cmd == "screenshot"):
            record_responses()
        elif(cmd == "student"):
            id = input("ID: ")
            choice = input("choice: ")
            student_response(id, count, choice)


def student_response(id, number, letter):
    """This method is the one used to log student responses.

    @param: id A hex-string of length sixth used to represent students.
    @param: number The number of times this student has already responded
            (starting at 0)
    @param: letter The letter that the student has chosen as their response.

    """

    response = 128
    if letter == 'a':
        response += 1
    elif letter == 'b':
        response += 2
    elif letter == 'c':
        response += 3
    elif letter == 'd':
        response += 4
    elif letter == 'e':
        response += 5

    write_report(b'\x02\x30' + chr(number) + b'\x05' + chr(response) +
                 bytearray.fromhex(id) + chr(100) + b'\x00' * 55)


def open_display():
    write_report(report_open_display)


def close_display():
    write_report(report_close_display)


def reset_display():
    write_report(report_reset_display)


def record_responses():
    write_report(report_record_responses)


def write_report(report):
    global addr
    with open('./Pathway', 'r') as o:
        if o.readline() == "Socket":
            s = socket.socket()
            s.connect(addr)
            s.sendall(report)
            s.close()
        else:
            with open('/dev/hidg0', 'rb+') as fd:
                fd.write(report)


if __name__ == "__main__":
    main()
