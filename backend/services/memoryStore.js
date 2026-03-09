// In-memory storage for demo purposes
let shipments = [];
let nextId = 1;

class MemoryStore {
  static async create(data) {
    const shipment = {
      _id: (nextId++).toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    shipments.push(shipment);
    return shipment;
  }

  static async find(filter = {}) {
    let results = [...shipments];
    
    if (filter.shipmentDate) {
      if (filter.shipmentDate.$gte) {
        results = results.filter(s => new Date(s.shipmentDate) >= filter.shipmentDate.$gte);
      }
      if (filter.shipmentDate.$lte) {
        results = results.filter(s => new Date(s.shipmentDate) <= filter.shipmentDate.$lte);
      }
    }
    
    if (filter.carrierName) {
      const regex = new RegExp(filter.carrierName, 'i');
      results = results.filter(s => regex.test(s.carrierName));
    }
    
    if (filter.lane) {
      const regex = new RegExp(filter.lane, 'i');
      results = results.filter(s => regex.test(s.lane));
    }
    
    return results.sort((a, b) => new Date(b.shipmentDate) - new Date(a.shipmentDate));
  }

  static async findById(id) {
    return shipments.find(s => s._id === id);
  }

  static async findByIdAndDelete(id) {
    const index = shipments.findIndex(s => s._id === id);
    if (index !== -1) {
      return shipments.splice(index, 1)[0];
    }
    return null;
  }

  static async clear() {
    shipments = [];
    nextId = 1;
  }
}

module.exports = MemoryStore;
