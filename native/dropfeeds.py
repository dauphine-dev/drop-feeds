#!/usr/bin/env python
import sys
import os
import json
import struct
import requests

try:
    def debug_print(mode, txt):
        with open(os.path.join(os.getenv('HOME'), "dropfeeds.debug.txt"), mode) as file:
            file.write(txt + "\n")

    def install():
        home_path = os.getenv('HOME')
        manifest = {
            'name': 'dropfeeds',
            'description': 'dropfeeds bypass CORS',
            'path': os.path.realpath(__file__),
            'type': 'stdio',
        }
        location = os.path.join(home_path, '.mozilla', 'native-messaging-hosts')
        filename = 'dropfeeds.json'
        file_path = os.path.join(location, filename)
        if os.path.exists(os.path.dirname(location)):
            if not os.path.exists(location):
                os.mkdir(location)
            browser_manifest = manifest.copy()
            browser_manifest['allowed_extensions'] = ['dropfeeds@dauphine.dev']
            sep_list = (',', ': ')
            json_string = json.dumps(browser_manifest, indent=2, separators=sep_list, sort_keys=True)
            json_string = json_string.replace('  ', '\t') + '\n'
            debug_print("a", "file_path: " + file_path)
            with open(file_path, 'w') as file:
                file.write(json_string)

    def getMessage():
        rawLength = sys.stdin.buffer.read(4)
        if len(rawLength) == 0:
            sys.exit(0)
        messageLength = struct.unpack('@I', rawLength)[0]
        message = sys.stdin.buffer.read(messageLength).decode('utf-8')
        return json.loads(message)

    def encodeMessage(messageContent):
        encodedContent = json.dumps(messageContent, separators=(',', ':')).encode('utf-8')
        encodedLength = struct.pack('@I', len(encodedContent))
        return {'length': encodedLength, 'content': encodedContent}

    def sendMessage(encodedMessage):
        sys.stdout.buffer.write(encodedMessage['length'])
        sys.stdout.buffer.write(encodedMessage['content'])
        sys.stdout.buffer.flush()

    def listen():
        url = getMessage()
        debug_print("a", "url: " + url)
        response = requests.get(url).text
        sendMessage(encodeMessage(response))

    def main(argv):
        debug_print("w", "argv:\n" + "\n".join(argv) + "\n---")
        if len(argv) == 2:
            if argv[1] == 'install':
                install()
                sys.exit(0)

        if "dropfeeds@dauphine.dev" in argv:
            listen()
            sys.exit(0)


    if __name__ == "__main__":
        main(sys.argv)

except AttributeError:
    print('Python 3.x is required.')
    sys.exit(-1)
