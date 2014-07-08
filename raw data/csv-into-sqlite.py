import csv
import sqlite3

from sys import argv
csvfilename = argv[1]
databasefile = argv[2]
tablename = argv[3]
columncount = argv[4]

paramstring = ', '.join(['?' for i in range(int(columncount))])

f = open(csvfilename)
conn = sqlite3.connect(databasefile)
c = conn.cursor()

reader = csv.reader(f, delimiter=',', quotechar='"')
c.executemany("""
  insert into {0} values ({1})
""".format(tablename, paramstring), iter(reader))
  

conn.commit()
conn.close()
f.close()
