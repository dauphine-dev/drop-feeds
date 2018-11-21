<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
          <xsl:element name="link">
            <xsl:attribute name="rel">icon</xsl:attribute>
            <xsl:attribute name="type">image/png/css</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="/render/context/icon"></xsl:value-of></xsl:attribute>
          </xsl:element>
          <xsl:element name="link">
            <xsl:attribute name="rel">stylesheet</xsl:attribute>
            <xsl:attribute name="type">text/css</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="/render/context/template"></xsl:value-of></xsl:attribute>
          </xsl:element>
          <xsl:element name="link">
            <xsl:attribute name="rel">stylesheet</xsl:attribute>
            <xsl:attribute name="type">text/css</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="/render/context/theme"></xsl:value-of></xsl:attribute>
          </xsl:element>
        <title>
          <xsl:value-of select="/render/channel/title"></xsl:value-of> - Drop-Feeds
        </title>
      </head>
      <body>
        <div id="channelHead">
          <div class="channelTitle">
            <span class="channelTitleText">
              <xsl:element name="a">
                <xsl:attribute name="target">_blank</xsl:attribute>
                <xsl:attribute name="class">channelLink</xsl:attribute>
                <xsl:attribute name="href">
                  <xsl:value-of select="/render/channel/link"></xsl:value-of>
                </xsl:attribute>
                <xsl:value-of select="/render/channel/title"></xsl:value-of>
              </xsl:element>
            </span>
          </div>
        </div>
        <div class="sep1"></div>

        <!-- ** topPanel ** -->
        <div id="topPanel">
          <table>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Visited</th>
              <th>Date</th>
            </tr>
            <xsl:for-each select="/render/items/item">
              <tr>
                <td>
                  <xsl:value-of select="./number" ></xsl:value-of>
                </td>
                <td>
                  <xsl:value-of select="./title" ></xsl:value-of>
                </td>
                <td></td>
                <td>
                  <xsl:value-of disable-output-escaping="yes" select="./pubDateText"/>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </div>

        <!-- ** splitterBar ** -->
        <div id="splitterBar"></div>

        <!-- **bottomPanel ** -->
        <div id="bottomPanel">
          <!-- <xsl:value-of select="./number" ></xsl:value-of> -->
          <xsl:for-each select="/render/items/item">
            <xsl:element name="div">
              <xsl:attribute name="class">item</xsl:attribute>
              <xsl:attribute name="id">item<xsl:value-of select="./number" ></xsl:value-of></xsl:attribute>
              <div class="itemHead">
                <div class="itemTitle">
                  <xsl:element name="a">
                    <xsl:attribute name="href">
                      <xsl:value-of select="./link"></xsl:value-of>
                    </xsl:attribute>
                    <xsl:value-of select="./title"></xsl:value-of>
                  </xsl:element>
                </div>
                <div class="itemInfo">
                  <xsl:element name="a">
                    <xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:attribute name="href">
                      <xsl:value-of select="./link"></xsl:value-of>
                    </xsl:attribute>
                    <xsl:element name="img">
                      <xsl:attribute name="border">0</xsl:attribute>
                      <xsl:attribute name="alt">alt</xsl:attribute>
                      <xsl:attribute name="src"><xsl:value-of select="/render/context/template"></xsl:value-of>/../../img/link-go.png</xsl:attribute>
                      <xsl:attribute name="width">20px</xsl:attribute>
                      <xsl:attribute name="height">20px</xsl:attribute>
                    </xsl:element>
                  </xsl:element>
                  <xsl:element name="a">
                    <xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:attribute name="href">
                      mailto:?subject=<xsl:value-of select="./title"></xsl:value-of>&amp;body=<xsl:value-of select="./link"></xsl:value-of>
                    </xsl:attribute>
                    <xsl:element name="img">
                      <xsl:attribute name="border">0</xsl:attribute>
                      <xsl:attribute name="alt">lnk</xsl:attribute>
                      <xsl:attribute name="src"><xsl:value-of select="/render/context/template"></xsl:value-of>/../../img/mail-to.png</xsl:attribute>
                      <xsl:attribute name="width">20px</xsl:attribute>
                      <xsl:attribute name="height">20px</xsl:attribute>
                    </xsl:element>
                  </xsl:element>
                  <span class="itemDate"><xsl:value-of select="./pubDateText"></xsl:value-of></span>
                </div>
              </div>
              <div class="itemDescription">
                <xsl:value-of select="./description"></xsl:value-of>
              </div>
            </xsl:element>
          </xsl:for-each>
        </div>
        <xsl:element name="script">
          <xsl:attribute name="src"><xsl:value-of select="/render/context/template"></xsl:value-of>/../../js/template.js</xsl:attribute>
        </xsl:element>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
