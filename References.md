# References

## Working-storage

```cobol
10 WS-B PIC A(10). *> Variable definition without initial value
10 WS-B PIC A(10) VALUE 'TUTORIALS'. *> " with initial value
10 WS-C OCCURS 5 TIMES. *> Occurs with trailing group
05 WS-A PIC A(10) VALUE 'TUTORIALS' OCCURS 5 TIMES. *> Variable definition with inital value + occurs
05 WS-A PIC A(10) OCCURS 10 TIMES INDEXED BY I. *> occurs with index
```

`<level> <name> <type>? <occurs>? <index>? <value>?`
