/*global ThemeManager*/
'use strict';
ThemeManager.instance.init_async().then(ThemeManager.instance.applyCssToCurrentDocument_async());

