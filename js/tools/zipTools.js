/*global JSZipUtils*/
'use strict';
class ZipTools { /*exported ZipTools*/
  static async getBinaryContent_async(url) {
    return new Promise((resolve, reject) => {
      JSZipUtils.getBinaryContent(url, (error, content) => {
        if (error) {
          reject(error);
        } else {
          resolve(content);
        }
      });
    });
  }
}