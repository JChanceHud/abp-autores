## ABP autoreserver

Automatically reserves a timeslot on certain days.

### Config

Rename `config.env.example` to `config.env` and change the contents to suite your needs.

### Starting

Run the `start.sh` script using a command like `sh start.sh`. This will start a docker container named `abp_autores`. This container will make a reservation shortly after midnight each day that you select.

### Stopping

Run the `stop.sh` script.

### Logs

Run the `logs.sh` script.
