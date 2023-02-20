<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html>
      <head>
        <xsl:element name="link">
          <xsl:attribute name="rel">icon</xsl:attribute>
          <xsl:attribute name="type">image/png/css</xsl:attribute>
          <xsl:attribute name="href">
            <xsl:value-of select="/render/context/icon"/>
          </xsl:attribute>
        </xsl:element>
          <xsl:element name="link">
            <xsl:attribute name="rel">stylesheet</xsl:attribute>
            <xsl:attribute name="type">text/css</xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="/render/context/subscribeButtonStyle"/></xsl:attribute>
          </xsl:element>
        <xsl:element name="link">
          <xsl:attribute name="rel">stylesheet</xsl:attribute>
          <xsl:attribute name="type">text/css</xsl:attribute>
          <xsl:attribute name="href">
            <xsl:value-of select="/render/context/template"/>
          </xsl:attribute>
        </xsl:element>
        <xsl:element name="link">
          <xsl:attribute name="rel">stylesheet</xsl:attribute>
          <xsl:attribute name="type">text/css</xsl:attribute>
          <xsl:attribute name="href">
            <xsl:value-of select="/render/context/theme"/>
          </xsl:attribute>
        </xsl:element>
        <title><span class="encodedText"><xsl:value-of select="/render/channel/title"/></span> - Drop Feeds</title>
        <xsl:element name="script">
          <xsl:attribute name="type">text/javascript</xsl:attribute>
          <xsl:attribute name="src">
            <xsl:value-of select="/render/context/scriptBrowserManager"/>
          </xsl:attribute>
        </xsl:element>        

        <xsl:element name="script">
          <xsl:attribute name="type">text/javascript</xsl:attribute>
          <xsl:attribute name="src">
            <xsl:value-of select="/render/context/scriptDefaultValues"/>
          </xsl:attribute>
        </xsl:element>        
        <xsl:element name="script">
          <xsl:attribute name="type">text/javascript</xsl:attribute>
          <xsl:attribute name="src">
            <xsl:value-of select="/render/context/scriptLocalStorageManager"/>
          </xsl:attribute>
        </xsl:element>        
      </head>
      <body>


        <!-- ** headBar ** -->
        <div id="channelHead">
          <div class="channelTitle">
            <span class="channelTitleText">
              <xsl:element name="a">
                <xsl:attribute name="target">_blank</xsl:attribute>
                <xsl:attribute name="class">channelLink</xsl:attribute>
                <xsl:attribute name="href">
                  <xsl:value-of select="/render/channel/link"/>
                </xsl:attribute>
                <span class="encodedText"><xsl:value-of select="/render/channel/title"/></span>
              </xsl:element>
            </span>
          </div>
          <div id="buttonsPannel">
              <xsl:element name="span">
                <xsl:attribute name="id">itemMarkAsReadButton</xsl:attribute>
                <xsl:attribute name="title">#Mark as read</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
              <xsl:element name="span">
                <xsl:attribute name="id">itemMarkAsUnreadButton</xsl:attribute>
                <xsl:attribute name="title">#Mark as unread</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
              <xsl:element name="span">
                <xsl:attribute name="id">itemMarkAllAsReadButton</xsl:attribute>
                <xsl:attribute name="title">#Mark all as read</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
              <xsl:element name="span">
                <xsl:attribute name="id">itemMarkAllAsUnreadButton</xsl:attribute>
                <xsl:attribute name="title">#Mark all as unread</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
              <xsl:element name="span">
                <xsl:attribute name="id">itemOpenUnreadButton</xsl:attribute>
                <xsl:attribute name="title">#Open unread items in new tabs</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
              <xsl:element name="span">
                <xsl:attribute name="id">itemHideReadArticlesButton</xsl:attribute>
                <xsl:attribute name="title">#Hide read articles</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
              <xsl:element name="span">
                <xsl:attribute name="id">itemSeparator1</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
              <xsl:element name="span">
                <xsl:attribute name="id">itemDelKeySwicthReadArticlesButton</xsl:attribute>
                <xsl:attribute name="title">#Use DEL key to switch read/undread articles</xsl:attribute>
                <xsl:attribute name="class">toolBarItem toolBarItemInactivated</xsl:attribute>
              </xsl:element>
          </div>
        </div>
        <div class="sep1"></div>
        <!-- ** topPanel ** -->
        <div id="topPanel">
          <table>
            <tr class="tableHeader" >
              <th></th>
              <th>Title</th>
              <th>Visited</th>
              <th>Date</th>
            </tr>
            <xsl:for-each select="/render/items/item">
              <tr>
                <td>
                  <xsl:element name="span">
                    <xsl:attribute name="url">
                      <xsl:value-of select="./link" />
                    </xsl:attribute>
                    <xsl:value-of select="./number" />
                  </xsl:element>
                </td>
                <td>
                  <span class="encodedText"><xsl:value-of select="./title" /></span>
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
          <!-- <xsl:value-of select="./number" /> -->
          <xsl:for-each select="/render/items/item">
            <xsl:element name="div">
              <xsl:attribute name="class">item</xsl:attribute>
              <xsl:attribute name="id">item<xsl:value-of select="./number" /></xsl:attribute>
              <div class="itemHead">
                <div class="itemTitle">
                  <xsl:element name="a">
                    <xsl:attribute name="target">
                      <xsl:value-of select="./target"/>
                    </xsl:attribute>
                    <xsl:attribute name="href">
                      <xsl:value-of select="./link"/>
                    </xsl:attribute>
                    <span class="encodedText"><xsl:value-of select="./title" /></span>
                  </xsl:element>
                </div>
                <div class="itemInfo">
                  <xsl:element name="a">
                    <xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:attribute name="href">
                      <xsl:value-of select="./link"/>
                    </xsl:attribute>
                    <xsl:element name="img">
                      <xsl:attribute name="border">0</xsl:attribute>
                      <xsl:attribute name="alt">alt</xsl:attribute>
                      <xsl:attribute name="src">
                        <xsl:value-of select="/render/context/template"/>/../../img/link-go.png
                      </xsl:attribute>
                      <xsl:attribute name="width">20px</xsl:attribute>
                      <xsl:attribute name="height">20px</xsl:attribute>
                    </xsl:element>
                  </xsl:element>
                  <xsl:element name="a">
                    <xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:attribute name="href">mailto:?subject=<xsl:value-of select="./title"/>&amp;body=<xsl:value-of select="./link"/></xsl:attribute>
                    <xsl:element name="img">
                      <xsl:attribute name="border">0</xsl:attribute>
                      <xsl:attribute name="alt">lnk</xsl:attribute>
                      <xsl:attribute name="src">
                        <xsl:value-of select="/render/context/template"/>/../../img/mail-to.png
                      </xsl:attribute>
                      <xsl:attribute name="width">20px</xsl:attribute>
                      <xsl:attribute name="height">20px</xsl:attribute>
                    </xsl:element>
                  </xsl:element>
                  <span class="itemDate">
                    <xsl:value-of select="./pubDateText"/>
                  </span>
                </div>
              </div>
              <xsl:if test="./thumbnail!='null'">
                <div class="itemDescription">
                  <!-- thumbnail -->
                  <xsl:element name="a">
                    <xsl:attribute name="target"><xsl:value-of select="./target"/></xsl:attribute>
                    <xsl:attribute name="href"><xsl:value-of select="./link"/></xsl:attribute>
                    <xsl:element name="img">
                      <xsl:attribute name="src"><xsl:value-of select="./thumbnail"/></xsl:attribute>
                      <xsl:attribute name="style">float: left; margin-right: 15px; margin-bottom: 4px; max-width:320px; max-height:200px;</xsl:attribute>
                    </xsl:element>
                  </xsl:element>
                </div>
              </xsl:if>
              <!-- description -->
              <div class="itemDescription">
                <span class="encodedHtml"><xsl:value-of select="./description"/></span>
              </div>
              <p/>
              <!-- enclosures -->
              <xsl:if test="((./enclosures/enclosure/type='audio') or (./enclosures/enclosure/type='video') or (./enclosures/enclosure/type='image'))">
                <div class="itemEnclosure">
                  <xsl:if test="./enclosures/enclosure/type='audio'">
                    <div class="itemAudioPlayer">
                      <audio preload="none" controls="controls">
                        <xsl:element name="source">
                          <xsl:attribute name="src"><xsl:value-of select="./enclosures/enclosure/link"/></xsl:attribute>
                          <xsl:attribute name="type"><xsl:value-of select="./enclosures/enclosure/mimetype "/></xsl:attribute>
                        </xsl:element>
                      </audio>
                    </div>
                  </xsl:if>
                  <xsl:if test="./enclosures/enclosure/type='video'">
                    <div class="itemVideoPlayer">
                      <video width="640" height="480" preload="none" controls="controls">
                        <xsl:element name="source">
                          <xsl:attribute name="src"><xsl:value-of select="./enclosures/enclosure/link"/></xsl:attribute>
                          <xsl:attribute name="type"><xsl:value-of select="./enclosures/enclosure/mimetype "/></xsl:attribute>
                        </xsl:element>
                      </video>
                    </div>
                  </xsl:if>
                  <xsl:if test="./enclosures/enclosure/type='image'">
                    <div class="itemImage">
                      <xsl:element name="img">
                        <xsl:attribute name="src"><xsl:value-of select="./enclosures/enclosure/link"/></xsl:attribute>
                        <xsl:attribute name="width">640</xsl:attribute>
                        <xsl:attribute name="height">480</xsl:attribute>
                      </xsl:element>
                    </div>
                  </xsl:if>
                  <div class="itemEnclosureLink">
                    <xsl:element name="a">
                      <xsl:attribute name="href"><xsl:value-of select="./enclosures/enclosure/link"/></xsl:attribute>
                      <xsl:attribute name="download"></xsl:attribute>
                      <xsl:value-of select="./enclosures/enclosure/link"/>
                    </xsl:element>
                  </div>
                </div>
              </xsl:if>
              <!-- enclosures (end) -->              
            </xsl:element>
          </xsl:for-each>
        </div>
        <xsl:element name="script">
          <xsl:attribute name="type">text/javascript</xsl:attribute>
          <xsl:attribute name="src">
            <xsl:value-of select="/render/context/script"/>
          </xsl:attribute>
        </xsl:element>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
