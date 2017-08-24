# Connectors
Draw connecting line or polyline between two DIV's. Each line is a DIV

See connectors.html for examples

Function:
connect (prefix, firstBlokId, firstBlokPosition, secondBlockId, secondBlockPosition, style, className, title, point_style)

#prefix
Some first letters of ID of group of DIVs. Connection lines will not cross this DIVs. For example, "block"

#firstBlokId, #secondBlockId
Some last letters of DIVs ID. In this way, for DIV with ID="block_1" #prefix will be "block" and #firstBlokId will be "_1"

#firstBlokPosition, #secondBlockPosition
Position of points to connect. One of: "top", "bottom", "left", "right", "center"

#style
'line' or 'polyline'

#className
class name for connecting lines

#title
title for connecting lines

#point_style
class name for start&finish points of connecting line
