<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes" />  
  <xsl:template match="/">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>        
          <xsl:element name="link">
            <xsl:attribute name="rel">icon</xsl:attribute>
            <xsl:attribute name="type">image/png/css</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="feed/style/icon"></xsl:value-of></xsl:attribute>
          </xsl:element>
          <xsl:element name="link">
            <xsl:attribute name="rel">stylesheet</xsl:attribute>
            <xsl:attribute name="type">text/css</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="feed/style/template"></xsl:value-of></xsl:attribute>
          </xsl:element>
          <xsl:element name="link">
            <xsl:attribute name="rel">stylesheet</xsl:attribute>
            <xsl:attribute name="type">text/css</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="feed/style/theme"></xsl:value-of></xsl:attribute>
          </xsl:element>
        <title><xsl:value-of select="feed/channel/title"></xsl:value-of> - Drop-Feeds</title>
      </head>
     <body>
      <div class="channelHead ">
        <h1 class="channelTitle">
          <xsl:element name="a">
            <xsl:attribute name="class">channelLink</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="feed/channel/url"></xsl:value-of></xsl:attribute>
            <xsl:value-of select="feed/channel/title"></xsl:value-of>
          </xsl:element>
        </h1>
        
        <p class="channelDescription"><xsl:value-of select="feed/channel/description"></xsl:value-of></p>
      </div>

	    <xsl:for-each select="feed/items/item">
        <div class="item">
          <h2 class="itemTitle ">
            <span class="itemNumber"><xsl:value-of select="./number" ></xsl:value-of>.</span>
            <xsl:element name="a">
              <xsl:attribute name="href"><xsl:value-of select="./url"></xsl:value-of></xsl:attribute>
              <xsl:value-of select="./title" ></xsl:value-of>
            </xsl:element>
          </h2>
          <div class="itemDescription"><xsl:value-of disable-output-escaping="yes" select="./description"/></div>          
          <div class="itemInfo">
            <div   class="itemPubDate"><xsl:value-of disable-output-escaping="yes" select="./pubDateText"/></div>
          </div>
        </div>
	    </xsl:for-each>      
      </body>
    </html>
  </xsl:template>
    
</xsl:stylesheet>
