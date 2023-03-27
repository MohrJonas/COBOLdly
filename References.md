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

## Rules

| CBL00 | Sanity check                     |
|-------|----------------------------------|
| CBL01 | Force uppercase for keywords     |
| CBL02 | Force lowercase for keywords     |
| CBL03 | Force comment for sections       |
| CBL04 | Force comment for variables      |
| CBL05 | Force dual quotes for literals   |
| CBL06 | Force single quotes for literals |
| CBL07 | Force variables to have an inital value |
| CBL08 | Force 5-step variable levels |
| CBL09 | Force 1-step variable levels |
