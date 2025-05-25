from flask import Flask, request, render_template, redirect, url_for
import threading
import time
import diskcache

app = Flask(__name__)
cache = diskcache.Cache("/tmp/cache")

rps_log = []
measure_duration = 0
request_count = 0
lock = threading.Lock()
running = False

def reset_counter():
    global request_count, rps_log, running, measure_duration
    start_time = time.time()
    while running:
        time.sleep(1)
        with lock:
            now = time.time()
            elapsed = int(now - start_time)
            rps_log.append((elapsed, request_count))
            if elapsed >= measure_duration:
                running = False
            request_count = 0
            cache.set("rps_log", rps_log, expire=measure_duration + 10)

@app.before_request
def count_request():
    global request_count
    if running:
        with lock:
            request_count += 1

@app.route("/", methods=["GET", "POST"])
def index():
    global measure_duration, rps_log, running
    if request.method == "POST":
        val = request.form.get("duration")
        if val and val.isdigit():
            val_int = int(val)
            if 1 <= val_int <= 260:
                measure_duration = val_int
                rps_log = []
                cache.clear()
                global running
                running = True
                threading.Thread(target=reset_counter, daemon=True).start()
                return redirect(url_for("dashboard"))
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    data = cache.get("rps_log") or []
    return render_template("dashboard.html", data=data, duration=measure_duration)

if __name__ == "__main__":
    app.run()
