import sys


def main():
    studentID = sys.argv[1]
    vote = sys.argv[2]
    idempotencyByte = sys.argv[3]
    student_response(studentID, vote, idempotencyByte)


def student_response(studentID, vote, idempotencyByte):
    value = 128
    if vote == 'A':
        value += 1
    elif vote == 'B':
        value += 2
    elif vote == 'C':
        value += 3
    elif vote == 'D':
        value += 4
    elif vote == 'E':
        value += 5
#    print(read())
    write_report(b'\x02\x30' + bytes([int(idempotencyByte)]) + b'\x05' + bytes(
        [value]) + bytearray.fromhex(studentID) + b'\x00' * 56)


def write_report(report):
    with open('/dev/hidg0', 'rb+') as fd:
        fd.write(report)


def read():
    with open('/dev/hidg0', 'rb+') as fd:
        return fd.read(64)


if __name__ == "__main__":
    main()
