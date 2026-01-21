import tkinter as tk
import heapq

# ---------------- Simulator ----------------

class Simulator:
    def __init__(self):
        self.time = 0
        self.queue = []
        self.event_id = 0
        self.running = False

    def schedule(self, delay, func, *args):
        self.event_id += 1
        heapq.heappush(self.queue, (self.time + delay, self.event_id, func, args))

    def step(self):
        if not self.queue:
            return False
        self.time, _, func, args = heapq.heappop(self.queue)
        func(*args)
        return True


# ---------------- Packet ----------------

class Packet:
    def __init__(self, src, msg_id, ttl):
        self.src = src
        self.msg_id = msg_id
        self.ttl = ttl


# ---------------- Node ----------------

class Node:
    RADIUS = 18

    def __init__(self, node_id, sim, canvas, x, y):
        self.id = node_id
        self.sim = sim
        self.canvas = canvas
        self.x, self.y = x, y

        self.neighbors = []
        self.seen = set()
        self.received = 0
        self.forwarded = 0

        self.circle = canvas.create_oval(
            x - self.RADIUS, y - self.RADIUS,
            x + self.RADIUS, y + self.RADIUS,
            fill="lightgray"
        )
        self.label = canvas.create_text(x, y, text=str(node_id))

    def connect(self, other):
        self.neighbors.append(other)
        self.canvas.create_line(self.x, self.y, other.x, other.y)

    def receive(self, packet, from_node):
        key = (packet.src, packet.msg_id)
        if key in self.seen:
            return

        self.seen.add(key)
        self.received += 1
        self.canvas.itemconfig(self.circle, fill="green")

        if packet.ttl <= 0:
            return

        packet.ttl -= 1
        self.forward(packet, from_node)

    def forward(self, packet, from_node):
        self.forwarded += 1
        self.canvas.itemconfig(self.circle, fill="orange")

        for n in self.neighbors:
            if n != from_node:
                self.sim.schedule(
                    1,
                    n.receive,
                    Packet(packet.src, packet.msg_id, packet.ttl),
                    self
                )


# ---------------- GUI ----------------

class FloodingGUI:
    def __init__(self, root):
        self.root = root
        root.title("Flooding Routing Simulation")

        self.canvas = tk.Canvas(root, width=600, height=400, bg="white")
        self.canvas.pack()

        self.sim = Simulator()
        self.nodes = self.build_network()

        controls = tk.Frame(root)
        controls.pack()

        tk.Button(controls, text="Flood", command=self.start_flood).pack(side=tk.LEFT)
        tk.Button(controls, text="Step", command=self.step).pack(side=tk.LEFT)
        tk.Button(controls, text="Run", command=self.run).pack(side=tk.LEFT)

    def build_network(self):
        nodes = [
            Node(0, self.sim, self.canvas, 100, 200),
            Node(1, self.sim, self.canvas, 200, 100),
            Node(2, self.sim, self.canvas, 300, 200),
            Node(3, self.sim, self.canvas, 400, 100),
            Node(4, self.sim, self.canvas, 500, 200),
            Node(5, self.sim, self.canvas, 300, 320),
            Node(6, self.sim, self.canvas, 100, 320),
        ]

        links = [(0,1),(1,2),(2,3),(3,4),(2,5),(1,5), (1,6), (6,4)]

        for a, b in links:
            nodes[a].connect(nodes[b])
            nodes[b].connect(nodes[a])

        return nodes

    def start_flood(self):
        pkt = Packet(src=0, msg_id=1, ttl=4)
        self.nodes[0].receive(pkt, None)

    def step(self):
        if not self.sim.step():
            print("Simulation finished")

    def run(self):
        if self.sim.step():
            self.root.after(300, self.run)


# ---------------- Main ----------------

root = tk.Tk()
FloodingGUI(root)
root.mainloop()
